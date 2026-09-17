# eRanker Viral Radar API

Standalone Vercel FastAPI service for TikTok Login Kit and the Display API.

It requires these Vercel server environment variables:

- `TIKTOK_CLIENT_KEY`
- `TIKTOK_CLIENT_SECRET`
- `TIKTOK_REDIRECT_URI`
- `DATABASE_URL` from the attached Neon Postgres store

It deliberately requests only `user.info.basic`, `user.info.stats`, and `video.list` and provides no posting endpoints.
