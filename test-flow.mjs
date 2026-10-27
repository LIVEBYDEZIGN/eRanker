import { normalizeWhatsApp, setupPhoneInput } from './phone-input.mjs?v=intake-3';

export const FORM_URL = 'https://api.hsforms.com/submissions/v3/integration/submit/48846766/5e37ba79-2b57-4acd-892b-ea180b6a14aa';
export const PAYMENT_LINK_ID = '10567449';
export const WHATSAPP_NUMBER = '13057966231';
export const FIELD_IDS = ['listing', 'keyword1', 'keyword2', 'keyword3', 'firstname', 'email', 'phone-country', 'whatsapp'];
export const STORAGE_KEY = 'eranker-ranking-order-v2';
export const DRAFT_TTL = 24 * 60 * 60 * 1000;
const SUBMISSION_HOSTS = ['eranker.net', 'www.eranker.net', 'eranker-paid-flow-check-20261026.eranker.chatgpt.site'];

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
    data.listing = `https://www.etsy.com/listing/${match[1]}`;
  } catch { errors.listing = 'Paste your Etsy listing link, including /listing/ and its number.'; }
  for (const key of ['keyword1', 'keyword2', 'keyword3']) {
    if (!data[key] || data[key].length > 200 || /[\r\n]/.test(data[key])) errors[key] = 'Enter one keyword option for this listing.';
  }
  if (!data.firstname || data.firstname.length > 100 || /[\r\n]/.test(data.firstname)) errors.firstname = 'Enter your name.';
  if (!validEmail(data.email)) errors.email = 'Enter your email address.';
  data.email = data.email.toLowerCase();
  const number = normalizeWhatsApp(data.whatsapp, data['phone-country']);
  if (number.countryError) errors['phone-country'] = number.countryError;
  if (number.error) errors.whatsapp = number.error;
  if (number.number) { data.whatsapp = number.number; data['phone-country'] = number.country; }
  return { data, errors };
}

export function buildSubmission(data, pageUri) {
  const page = new URL(pageUri);
  return {
    submittedAt: Date.now(),
    fields: [
      ['etsy_listing_url', data.listing], ['target_keyword', data.keyword1],
      ['keyword_2', data.keyword2], ['keyword_3', data.keyword3],
      ['firstname', data.firstname], ['email', data.email],
      ['hs_whatsapp_phone_number', data.whatsapp]
    ].map(([name, value]) => ({ objectTypeId: '0-1', name, value })).concat([
      { objectTypeId: '0-0', name: 'payment_link_id', value: PAYMENT_LINK_ID }
    ]),
    context: { pageUri: `${page.origin}${page.pathname}`, pageName: 'eRanker | $35 ranking test' }
  };
}

export function checkoutUrl(redirectUri) {
  const url = new URL(redirectUri);
  if (url.origin !== 'https://payments-na1.hubspot.com' || !/^\/payments\/purchase\/hscs_[a-zA-Z0-9]+$/.test(url.pathname)) throw new Error('checkout-unavailable');
  // Use HubSpot's form-linked checkout session, never the generic payment link.
  return url.href;
}

export async function saveAndCreateCheckout(data, { pageUri, fetchImpl = fetch, timeoutMs = 15000 } = {}) {
  if (!SUBMISSION_HOSTS.includes(new URL(pageUri).hostname)) throw new Error('preview-only');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(FORM_URL, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(buildSubmission(data, pageUri))
    });
    if (!response.ok) throw new Error('save-not-confirmed');
    const result = await response.json();
    return checkoutUrl(result.redirectUri);
  } finally { clearTimeout(timer); }
}

export function buildMessage(data) {
  return `Hi Laura, here are the details for my ranking test.\n\nname: ${data.firstname}\nlisting id: ${data.listing}\nkeyword 1: ${data.keyword1}\nkeyword 2: ${data.keyword2}\nkeyword 3: ${data.keyword3}\nemail: ${data.email}\nwhatsapp: ${data.whatsapp}`;
}

export function buildWhatsAppUrl(data) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(data))}`;
}

export function restoreOrder(raw, email = '', now = Date.now()) {
  try {
    const saved = JSON.parse(raw);
    if (!saved || !Number.isFinite(saved.updatedAt) || saved.updatedAt > now || now - saved.updatedAt > DRAFT_TTL || !saved.data) return null;
    if (email && saved.data.email?.toLowerCase() !== email.toLowerCase()) return null;
    if (Object.keys(normalizeAndValidate(saved.data).errors).length) return null;
    return saved;
  } catch { return null; }
}

function readOrder(email = '') {
  for (const storage of [() => sessionStorage, () => localStorage]) {
    try {
      const store = storage();
      const order = restoreOrder(store.getItem(STORAGE_KEY), email);
      if (order) return order;
    } catch { /* Browser storage can be restricted. */ }
  }
  return null;
}

function remember(order) {
  let saved = false;
  for (const storage of [() => sessionStorage, () => localStorage]) {
    try {
      const store = storage();
      store.setItem(STORAGE_KEY, JSON.stringify(order));
      saved ||= Boolean(restoreOrder(store.getItem(STORAGE_KEY), order.data.email));
    } catch { /* Try the other browser store. */ }
  }
  return saved;
}

if (typeof document !== 'undefined') {
  const form = document.getElementById('ranking-form');
  if (form) {
    const button = document.getElementById('submit-details');
    const status = document.getElementById('save-status');
    const phone = setupPhoneInput();
    let busy = false;
    const saved = readOrder();
    if (saved && !saved.returnedAt) {
      for (const id of FIELD_IDS) document.getElementById(id).value = saved.data[id] ?? '';
      phone.refresh(true);
    }
    button.disabled = false;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy) return;
      const { data, errors } = normalizeAndValidate(Object.fromEntries(FIELD_IDS.map(id => [id, document.getElementById(id).value])));
      for (const id of FIELD_IDS) {
        const input = document.getElementById(id);
        const error = document.getElementById(`${id}-error`);
        input.setAttribute('aria-invalid', errors[id] ? 'true' : 'false');
        error.textContent = errors[id] || '';
        error.hidden = !errors[id];
      }
      if (Object.keys(errors).length) {
        status.textContent = 'Check the highlighted details below.';
        document.getElementById(Object.keys(errors)[0]).focus();
        return;
      }
      busy = true;
      button.disabled = true;
      button.textContent = 'Saving your details…';
      status.textContent = '';
      const order = { data, updatedAt: Date.now() };
      // Save locally before leaving the site so the full WhatsApp message survives checkout.
      if (!remember(order)) {
        status.textContent = 'Please allow browser storage or open this page in your regular browser, so your details can follow you through payment.';
        busy = false; button.disabled = false; button.textContent = 'Continue to payment'; return;
      }
      try {
        const url = await saveAndCreateCheckout(data, { pageUri: location.href });
        remember({ ...order, checkoutUrl: url, updatedAt: Date.now() });
        window.erankerTrack?.('Lead', data);
        button.textContent = 'Opening secure payment…';
        location.assign(url);
      } catch {
        status.textContent = 'We couldn’t confirm your details were saved. Please try again. You haven’t been charged.';
        busy = false; button.disabled = false; button.textContent = 'Continue to payment';
      }
    });
    // Restore the button after the buyer presses Back from checkout.
    window.addEventListener('pageshow', () => { busy = false; button.disabled = false; button.textContent = 'Continue to payment'; });
  }

  if (document.getElementById('handoff')) {
    const params = new URLSearchParams(location.search);
    const email = validEmail(params.get('email') ?? '') ? params.get('email').toLowerCase() : '';
    let order = readOrder(email);
    const returned = params.get('checkout') === 'complete' || Boolean(order?.returnedAt);
    if (returned && order?.checkoutUrl) {
      order = { ...order, returnedAt: order.returnedAt || Date.now() };
      remember(order);
    }
    if (location.search) history.replaceState(null, '', location.pathname);
    const link = document.getElementById('whatsapp-link');
    const status = document.getElementById('handoff-description');
    const title = document.getElementById('handoff-title');
    function openWhatsApp(url) {
      const navigate = () => location.replace(url);
      if (window.erankerTrack) window.erankerTrack('Contact', {}, navigate);
      else navigate();
    }
    function prepareWhatsApp(url) {
      // Keep personal details out of analytics' automatic outbound-link capture.
      link.href = `https://wa.me/${WHATSAPP_NUMBER}`;
      link.hidden = false;
      link.addEventListener('click', event => { event.preventDefault(); openWhatsApp(url); });
    }
    if (returned && order?.checkoutUrl) {
      // The provider owns payment status. This page never sets paid properties
      // or treats a customer-edited URL / WhatsApp message as proof of payment.
      title.textContent = 'Opening WhatsApp…';
      document.getElementById('payment-returned').hidden = false;
      status.textContent = 'Your message is ready. Tap Send in WhatsApp to start the conversation with Laura.';
      const messageUrl = buildWhatsAppUrl(order.data);
      prepareWhatsApp(messageUrl);
      document.getElementById('message-preview').textContent = buildMessage(order.data);
      document.getElementById('message-details').hidden = false;
      // This is an automatic return relay, not another customer step.
      // Keep the page only as a recovery route if app handoff is blocked.
      if (!order.handoffStarted) {
        remember({ ...order, handoffStarted: true });
        openWhatsApp(messageUrl);
      }
    } else {
      title.textContent = returned ? 'Opening WhatsApp…' : 'Your ranking test';
      status.textContent = returned ? 'Send Laura your checkout email so she can find your test details.' : 'Add your listing details, then complete the $35 payment.';
      if (returned) {
        const text = `Hi Laura, please help me start my ranking test.${email ? `\nemail: ${email}` : '\nI can share my checkout email here.'}`;
        const messageUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
        prepareWhatsApp(messageUrl);
        if (params.get('checkout') === 'complete') openWhatsApp(messageUrl);
      } else document.getElementById('start-test').hidden = false;
    }
  }
}
