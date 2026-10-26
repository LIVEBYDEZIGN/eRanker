import { validEmail } from './ranking-test.mjs';

// Only accept a return from our own page loaded inside the payment iframe.
// Provider messages are not used to declare a successful payment.
export function checkoutReturnUrl(event, frameWindow, origin) {
  if (!frameWindow || event.source !== frameWindow || event.origin !== origin || event.data?.type !== 'eranker-checkout-return' || !validEmail(event.data.email)) return null;
  const url = new URL('/ranking-test.html', origin);
  url.searchParams.set('checkout', 'complete');
  url.searchParams.set('email', event.data.email);
  return url.href;
}

if (typeof document !== 'undefined' && document.querySelector('.payments-iframe-container')) {
  const container = document.querySelector('.payments-iframe-container');
  const loading = document.getElementById('checkout-loading');
  window.addEventListener('message', event => {
    const url = checkoutReturnUrl(event, container.querySelector('iframe')?.contentWindow, location.origin);
    if (url) location.replace(url);
  });
  const observer = new MutationObserver(() => {
    const frame = container.querySelector('iframe');
    if (!frame) return;
    frame.title = 'Secure $35 ranking test checkout by HubSpot';
    frame.addEventListener('load', () => { loading.hidden = true; }, { once: true });
    observer.disconnect();
  });
  observer.observe(container, { childList: true });
  const script = document.createElement('script');
  script.src = 'https://static.hsappstatic.net/payments-embed/ex/PaymentsEmbedCode.js';
  script.onload = () => window.startPaymentsEmbedScriptImmediate?.();
  script.onerror = () => { loading.textContent = 'Checkout could not load. Use the secure checkout link below.'; };
  document.head.append(script);
}
