import { normalizeWhatsApp, setupPhoneInput } from './phone-input.mjs';
import { showCheckoutEmail } from './checkout-email.mjs';

// Only the public website can submit. Local audits cannot create contacts.
// A form submission never changes or fabricates payment status.
export const LIVE_SUBMISSIONS_ENABLED = true;
export const SUBMISSION_HOSTS = ['eranker.net', 'www.eranker.net'];
export function canSubmitOnHost(host) { return LIVE_SUBMISSIONS_ENABLED && SUBMISSION_HOSTS.includes(host); }
export const FORM_URL = 'https://api.hsforms.com/submissions/v3/integration/submit/48846766/5e37ba79-2b57-4acd-892b-ea180b6a14aa';
export const WHATSAPP_NUMBER = '13057966231';
const FIELD_IDS = ['listing', 'keyword1', 'keyword2', 'keyword3', 'email', 'phone-country', 'whatsapp'];
const STORAGE_KEY = 'eranker-paid-test-setup-v1';
const DRAFT_TTL = 2 * 60 * 60 * 1000;

export function validEmail(value) {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
}

export function normalizeAndValidate(raw) {
  const data = Object.fromEntries(FIELD_IDS.map(id => [id, String(raw[id] ?? '').trim()]));
  const errors = {};
  try {
    const url = new URL(/^https?:\/\//i.test(data.listing) ? data.listing : `https://${data.listing}`);
    const isEtsy = /^(?:[a-z0-9-]+\.)*etsy\.(?:com|co\.uk|de|fr|ca|com\.au|com\.nz|it|nl|es)$/i.test(url.hostname);
    const match = url.pathname.match(/^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?listing\/(\d+)(?:\/|$)/i);
    if (!isEtsy || !match || url.username || url.password || url.port || data.listing.length > 2000) throw new Error('listing');
    // Keep only the listing identifier, without tracking parameters or fragments.
    data.listing = `https://www.etsy.com/listing/${match[1]}`;
  } catch {
    errors.listing = 'Paste the full Etsy listing link, including /listing/ and its number.';
  }
  for (const key of ['keyword1', 'keyword2', 'keyword3']) {
    if (!data[key] || data[key].length > 200 || /[\r\n]/.test(data[key])) errors[key] = 'Enter one keyword option for this listing.';
  }
  if (!validEmail(data.email)) errors.email = 'Enter the email address used for your payment.';
  const number = normalizeWhatsApp(data.whatsapp, data['phone-country']);
  if (number.countryError) errors['phone-country'] = number.countryError;
  if (number.error) errors.whatsapp = number.error;
  if (number.number) { data.whatsapp = number.number; data['phone-country'] = number.country; }
  return { data, errors };
}

export function buildMessage(data) {
  // Checkout already collected the name. Match by email without inventing or
  // overwriting it in the follow-up form.
  return `listing id: ${data.listing}\nkeyword 1: ${data.keyword1}\nkeyword 2: ${data.keyword2}\nkeyword 3: ${data.keyword3}\nemail: ${data.email}\nwhatsapp: ${data.whatsapp}`;
}

export function buildWhatsAppUrl(data) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(data))}`;
}

export function buildSubmission(data, pageUri) {
  const page = new URL(pageUri);
  return {
    submittedAt: Date.now(),
    fields: [
      ['etsy_listing_url', data.listing],
      ['target_keyword', data.keyword1],
      ['keyword_2', data.keyword2],
      ['keyword_3', data.keyword3],
      ['email', data.email],
      ['hs_whatsapp_phone_number', data.whatsapp]
    ].map(([name, value]) => ({ objectTypeId: '0-1', name, value })),
    context: {
      pageUri: `${page.origin}${page.pathname}`,
      pageName: 'eRanker | Paid ranking test setup'
    }
  };
}

export async function submitToHubSpot(data, { pageUri, signal, fetchImpl = fetch, timeoutMs = 12000 } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, timeoutMs);
  try {
    const response = await fetchImpl(FORM_URL, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(buildSubmission(data, pageUri))
    });
    if (!response.ok) throw new Error('save-not-confirmed');
    // This acknowledges only the form save. It never confirms a payment,
    // changes a payment property, or follows a redirect supplied by the API.
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

export function restoreDraft(raw, checkoutEmail, now = Date.now()) {
  try {
    const saved = JSON.parse(raw);
    if (!saved || !Number.isFinite(saved.updatedAt) || now - saved.updatedAt > DRAFT_TTL || saved.updatedAt > now || !saved.data) return null;
    if (checkoutEmail && saved.data.email?.toLowerCase() !== checkoutEmail.toLowerCase()) return null;
    return saved;
  } catch { return null; }
}

if (typeof document !== 'undefined' && document.getElementById('ranking-form')) {
  const form = document.getElementById('ranking-form');
  const submitButton = document.getElementById('submit-details');
  const status = document.getElementById('save-status');
  const entry = document.getElementById('setup-entry');
  const handoff = document.getElementById('handoff');
  const message = document.getElementById('message-preview');
  const waLink = document.getElementById('whatsapp-link');
  const title = document.getElementById('handoff-title');
  const description = document.getElementById('handoff-description');
  const params = new URLSearchParams(location.search);
  const paramEmail = params.get('email')?.trim() ?? '';
  const checkoutEmail = validEmail(paramEmail) ? paramEmail : '';
  const live = canSubmitOnHost(location.hostname);
  const returnedFromCheckout = params.get('checkout') === 'complete' && Boolean(checkoutEmail);
  // The payment provider redirects its iframe to this same-origin page. Move
  // the form to the full page instead of nesting the next step in checkout.
  if (returnedFromCheckout && window.parent !== window) {
    window.parent.postMessage({ type: 'eranker-checkout-return', email: checkoutEmail }, location.origin);
  }
  document.getElementById('checkout-confirmation').hidden = !returnedFromCheckout;
  const phoneInput = setupPhoneInput();
  // Never expose the buyer's email in subsequent referrers or page analytics.
  if (location.search) history.replaceState(null, '', location.pathname + location.hash);
  // Tracking starts after checkout email has been removed from the address.
  if (live && window.parent === window) import('./tracking.js').catch(() => {});
  let restored = null;
  try { restored = restoreDraft(sessionStorage.getItem(STORAGE_KEY), checkoutEmail); } catch { /* Storage is optional. */ }
  let lastSaved = restored?.savedFingerprint ?? '';
  if (restored) for (const id of FIELD_IDS) document.getElementById(id).value = restored.data[id] ?? '';
  phoneInput.refresh(true);
  const rememberedCheckoutEmail = checkoutEmail || restored?.checkoutEmail || '';
  if (validEmail(rememberedCheckoutEmail) && (checkoutEmail || rememberedCheckoutEmail === document.getElementById('email').value)) {
    showCheckoutEmail(rememberedCheckoutEmail);
  }
  const rawValues = () => Object.fromEntries(FIELD_IDS.map(id => [id, document.getElementById(id).value]));
  const remember = () => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ data: rawValues(), checkoutEmail: rememberedCheckoutEmail, savedFingerprint: lastSaved, updatedAt: Date.now() })); } catch { /* Keep the form usable in private browsing. */ }
  };
  remember();
  submitButton.disabled = false;
  let busy = false;
  let attempt = 0;
  let activeController;
  const setBusy = value => {
    busy = value;
    for (const element of form.querySelectorAll('input, select, button')) element.disabled = value;
    form.setAttribute('aria-busy', String(value));
    status.textContent = value ? (live ? 'Saving your details…' : 'Preparing your details…') : '';
  };
  form.addEventListener('input', event => {
    if (FIELD_IDS.includes(event.target.id)) {
      event.target.removeAttribute('aria-invalid');
      document.getElementById(`${event.target.id}-error`).hidden = true;
    }
    remember();
  });
  const showHandoff = (data, saved) => {
    entry.hidden = true;
    handoff.hidden = false;
    document.querySelector('.setup-progress li[aria-current]')?.removeAttribute('aria-current');
    document.querySelector('.setup-progress li:last-child').setAttribute('aria-current', 'step');
    message.textContent = buildMessage(data);
    waLink.href = buildWhatsAppUrl(data);
    waLink.onclick = () => window.erankerTrack?.('Contact');
    waLink.hidden = !live;
    if (!live) {
      title.textContent = 'Your WhatsApp message is ready.';
      description.textContent = 'Open this form on eranker.net to save your details and continue to WhatsApp.';
      document.getElementById('message-details').open = true;
    } else if (saved) {
      title.textContent = 'Send your message to Laura.';
      description.textContent = 'Your details are saved. Tap Send in WhatsApp so Laura receives your message. If the chat didn’t open, use the button below.';
    } else {
      title.textContent = 'Continue with Laura on WhatsApp.';
      description.textContent = 'We couldn’t confirm the save. Your full details are ready in the message below. Open WhatsApp and tap Send so Laura receives them.';
    }
    title.focus();
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const { data, errors } = normalizeAndValidate(rawValues());
    for (const id of FIELD_IDS) {
      const input = document.getElementById(id);
      const error = document.getElementById(`${id}-error`);
      error.textContent = errors[id] ?? '';
      error.hidden = !errors[id];
      input.setAttribute('aria-invalid', String(Boolean(errors[id])));
    }
    const invalid = FIELD_IDS.find(id => errors[id]);
    if (invalid) { document.getElementById(invalid).focus(); return; }
    for (const id of FIELD_IDS) document.getElementById(id).value = data[id];
    phoneInput.refresh(true);
    remember();
    const currentAttempt = ++attempt;
    const fingerprint = JSON.stringify(data);
    activeController = new AbortController();
    setBusy(true);
    let saved = false;
    try {
      if (live && fingerprint !== lastSaved) {
        await submitToHubSpot(data, { pageUri: location.href, signal: activeController.signal });
        window.erankerTrack?.('Lead', data);
      }
      if (currentAttempt !== attempt) return;
      saved = live;
      if (saved) { lastSaved = fingerprint; remember(); }
    } catch {
      // Keep all details available to the paying customer. A failed or timed-out
      // save is never labelled as received, and no automatic retry is made.
    } finally {
      if (currentAttempt === attempt) { activeController = null; setBusy(false); }
    }
    if (currentAttempt !== attempt) return;
    showHandoff(data, saved);
    if (saved) { window.erankerTrack?.('Contact'); location.assign(buildWhatsAppUrl(data)); }
  });
  document.getElementById('return-to-form').addEventListener('click', () => {
    handoff.hidden = true;
    entry.hidden = false;
    document.querySelector('.setup-progress li[aria-current]')?.removeAttribute('aria-current');
    document.querySelector('.setup-progress li:nth-child(2)').setAttribute('aria-current', 'step');
    document.getElementById('listing').focus();
  });
  window.addEventListener('pagehide', () => { ++attempt; activeController?.abort(); remember(); setBusy(false); });
}
