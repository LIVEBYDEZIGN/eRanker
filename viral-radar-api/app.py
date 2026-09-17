"""TikTok Sandbox OAuth and owned-account analytics for eRanker Viral Radar.

This is a standalone Vercel FastAPI service. It intentionally supports only
the currently authorized eRanker TikTok account; it does not scrape or publish.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from hashlib import sha256
import os
import secrets
from threading import Lock
from typing import Any
from urllib.parse import urlencode

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import RedirectResponse


AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/"
TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"
USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/"
VIDEO_LIST_URL = "https://open.tiktokapis.com/v2/video/list/"
VIDEO_QUERY_URL = "https://open.tiktokapis.com/v2/video/query/"
SCOPES = frozenset({"user.info.basic", "user.info.stats", "video.list"})
USER_FIELDS = "open_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count"
VIDEO_FIELDS = "id,create_time,title,video_description,duration,share_url,view_count,like_count,comment_count,share_count"
STATE_TTL = timedelta(minutes=10)
REFRESH_MARGIN = timedelta(minutes=5)
_schema_lock = Lock()
_schema_ready = False

app = FastAPI(title="eRanker Viral Radar API", version="1.0.0")


def _config() -> dict[str, str]:
    values = {
        "client_key": os.getenv("TIKTOK_CLIENT_KEY", ""),
        "client_secret": os.getenv("TIKTOK_CLIENT_SECRET", ""),
        "redirect_uri": os.getenv("TIKTOK_REDIRECT_URI", ""),
        "database_url": os.getenv("DATABASE_URL", ""),
    }
    if not all(values.values()) or not values["redirect_uri"].startswith("https://"):
        raise HTTPException(status_code=503, detail="TikTok server configuration is incomplete")
    if not values["database_url"].startswith(("postgres://", "postgresql://")):
        raise HTTPException(status_code=503, detail="TikTok secure storage is incomplete")
    return values


def _connection(database_url: str):
    try:
        import psycopg
        return psycopg.connect(database_url, autocommit=True)
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="TikTok storage dependency is unavailable") from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="TikTok secure storage is unavailable") from exc


def _ensure_schema(database_url: str) -> None:
    global _schema_ready
    with _schema_lock:
        if _schema_ready:
            return
        try:
            with _connection(database_url) as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS tiktok_oauth_tokens (
                        open_id TEXT PRIMARY KEY,
                        access_token TEXT NOT NULL,
                        refresh_token TEXT NOT NULL,
                        granted_scopes TEXT NOT NULL,
                        access_expires_at TIMESTAMPTZ NOT NULL,
                        refresh_expires_at TIMESTAMPTZ NOT NULL,
                        is_active BOOLEAN NOT NULL DEFAULT FALSE,
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    )
                    """
                )
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS tiktok_oauth_states (
                        state_hash TEXT PRIMARY KEY,
                        expires_at TIMESTAMPTZ NOT NULL
                    )
                    """
                )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=503, detail="TikTok secure storage is unavailable") from exc
        _schema_ready = True


def _hash_state(state: str) -> str:
    return sha256(state.encode("utf-8")).hexdigest()


def _issue_state(database_url: str) -> str:
    _ensure_schema(database_url)
    state = secrets.token_urlsafe(32)
    try:
        with _connection(database_url) as connection, connection.cursor() as cursor:
            cursor.execute("DELETE FROM tiktok_oauth_states WHERE expires_at < NOW()")
            cursor.execute(
                "INSERT INTO tiktok_oauth_states (state_hash, expires_at) VALUES (%s, %s)",
                (_hash_state(state), datetime.now(timezone.utc) + STATE_TTL),
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail="TikTok secure storage is unavailable") from exc
    return state


def _consume_state(database_url: str, state: str | None) -> bool:
    if not state:
        return False
    _ensure_schema(database_url)
    try:
        with _connection(database_url) as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM tiktok_oauth_states
                WHERE state_hash = %s AND expires_at >= NOW()
                RETURNING state_hash
                """,
                (_hash_state(state),),
            )
            return cursor.fetchone() is not None
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail="TikTok secure storage is unavailable") from exc


async def _form_request(data: dict[str, str]) -> dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(TOKEN_URL, data=data)
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="TikTok token request failed") from exc
    if not isinstance(payload, dict) or payload.get("error"):
        raise HTTPException(status_code=502, detail="TikTok token request was rejected")
    return payload


def _token_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    try:
        now = datetime.now(timezone.utc)
        token = {
            "open_id": str(payload["open_id"]),
            "access_token": str(payload["access_token"]),
            "refresh_token": str(payload["refresh_token"]),
            "granted_scopes": frozenset(value.strip() for value in str(payload["scope"]).split(",") if value.strip()),
            "access_expires_at": now + timedelta(seconds=int(payload["expires_in"])),
            "refresh_expires_at": now + timedelta(seconds=int(payload["refresh_expires_in"])),
        }
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="TikTok returned an incomplete token response") from exc
    if SCOPES - token["granted_scopes"]:
        raise HTTPException(status_code=400, detail="TikTok did not grant the required analytics scopes")
    return token


def _save_token(database_url: str, token: dict[str, Any]) -> None:
    _ensure_schema(database_url)
    try:
        with _connection(database_url) as connection, connection.cursor() as cursor:
            cursor.execute("UPDATE tiktok_oauth_tokens SET is_active = FALSE WHERE is_active = TRUE")
            cursor.execute(
                """
                INSERT INTO tiktok_oauth_tokens (
                    open_id, access_token, refresh_token, granted_scopes,
                    access_expires_at, refresh_expires_at, is_active, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, TRUE, NOW())
                ON CONFLICT (open_id) DO UPDATE SET
                    access_token = EXCLUDED.access_token,
                    refresh_token = EXCLUDED.refresh_token,
                    granted_scopes = EXCLUDED.granted_scopes,
                    access_expires_at = EXCLUDED.access_expires_at,
                    refresh_expires_at = EXCLUDED.refresh_expires_at,
                    is_active = TRUE,
                    updated_at = NOW()
                """,
                (
                    token["open_id"], token["access_token"], token["refresh_token"],
                    ",".join(sorted(token["granted_scopes"])), token["access_expires_at"],
                    token["refresh_expires_at"],
                ),
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail="TikTok secure storage is unavailable") from exc


def _active_token(database_url: str) -> dict[str, Any]:
    _ensure_schema(database_url)
    try:
        with _connection(database_url) as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT open_id, access_token, refresh_token, granted_scopes,
                       access_expires_at, refresh_expires_at
                FROM tiktok_oauth_tokens WHERE is_active = TRUE
                ORDER BY updated_at DESC LIMIT 1
                """
            )
            row = cursor.fetchone()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail="TikTok secure storage is unavailable") from exc
    if row is None:
        raise HTTPException(status_code=401, detail="No TikTok account has been authorized")
    return {
        "open_id": str(row[0]), "access_token": str(row[1]), "refresh_token": str(row[2]),
        "granted_scopes": frozenset(value for value in str(row[3]).split(",") if value),
        "access_expires_at": row[4], "refresh_expires_at": row[5],
    }


async def _usable_token(config: dict[str, str]) -> dict[str, Any]:
    token = _active_token(config["database_url"])
    if token["access_expires_at"] > datetime.now(timezone.utc) + REFRESH_MARGIN:
        return token
    if token["refresh_expires_at"] <= datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="TikTok authorization expired; authorize again")
    refreshed = _token_from_payload(await _form_request({
        "client_key": config["client_key"], "client_secret": config["client_secret"],
        "grant_type": "refresh_token", "refresh_token": token["refresh_token"],
    }))
    if refreshed["open_id"] != token["open_id"]:
        raise HTTPException(status_code=502, detail="TikTok refresh returned a different account")
    _save_token(config["database_url"], refreshed)
    return refreshed


async def _api_request(method: str, url: str, token: str, *, params: dict[str, str] | None = None, body: dict[str, Any] | None = None) -> dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.request(method, url, params=params, json=body, headers={"Authorization": f"Bearer {token}"})
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="TikTok API request failed") from exc
    if not isinstance(payload, dict) or payload.get("error"):
        raise HTTPException(status_code=502, detail="TikTok API request was rejected")
    return payload


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/v1/integrations/tiktok/authorize")
def authorize():
    config = _config()
    state = _issue_state(config["database_url"])
    return RedirectResponse(f"{AUTHORIZE_URL}?{urlencode({
        'client_key': config['client_key'], 'response_type': 'code',
        'scope': ','.join(sorted(SCOPES)), 'redirect_uri': config['redirect_uri'], 'state': state,
    })}", status_code=302)


@app.get("/v1/integrations/tiktok/callback")
async def callback(code: str | None = None, state: str | None = None, error: str | None = None):
    if error:
        raise HTTPException(status_code=400, detail="TikTok authorization was declined")
    config = _config()
    if not code or not _consume_state(config["database_url"], state):
        raise HTTPException(status_code=400, detail="TikTok authorization state was invalid or expired")
    token = _token_from_payload(await _form_request({
        "client_key": config["client_key"], "client_secret": config["client_secret"],
        "code": code, "grant_type": "authorization_code", "redirect_uri": config["redirect_uri"],
    }))
    _save_token(config["database_url"], token)
    return {"connected": True, "open_id": token["open_id"], "granted_scopes": sorted(token["granted_scopes"])}


@app.get("/v1/integrations/tiktok/status")
def status():
    config = _config()
    try:
        token = _active_token(config["database_url"])
    except HTTPException as exc:
        if exc.status_code == 401:
            return {"connected": False}
        raise
    return {"connected": True, "open_id": token["open_id"], "granted_scopes": sorted(token["granted_scopes"])}


@app.get("/v1/integrations/tiktok/account")
async def account():
    token = await _usable_token(_config())
    payload = await _api_request("GET", USER_INFO_URL, token["access_token"], params={"fields": USER_FIELDS})
    try:
        return {"account": payload["data"]["user"]}
    except (KeyError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="TikTok returned incomplete account data") from exc


@app.get("/v1/integrations/tiktok/videos")
async def videos(max_count: int = Query(default=20, ge=1, le=20), cursor: int | None = None):
    token = await _usable_token(_config())
    body: dict[str, Any] = {"max_count": max_count}
    if cursor is not None:
        body["cursor"] = cursor
    payload = await _api_request("POST", VIDEO_LIST_URL, token["access_token"], params={"fields": VIDEO_FIELDS}, body=body)
    try:
        return payload["data"]
    except (KeyError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="TikTok returned incomplete video data") from exc


@app.get("/v1/integrations/tiktok/snapshot")
async def snapshot(max_count: int = Query(default=20, ge=1, le=20), cursor: int | None = None):
    profile = await account()
    video_page = await videos(max_count=max_count, cursor=cursor)
    return {"account": profile["account"], "videos": video_page}
