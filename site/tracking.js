// Production analytics. Private walkthroughs never report customer conversions.
(function () {
  if (!['eranker.net', 'www.eranker.net'].includes(location.hostname) || window.parent !== window) return;
  if (window.erankerTrack) return;
  const GA4_ID = 'G-FQ5CDMGQ6G';
  const safePage = new URL(location.pathname, location.origin);
  const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_term', 'utm_content', 'gclid', 'dclid', 'gbraid', 'wbraid'];
  const pageQuery = new URLSearchParams(location.search);
  for (const key of campaignKeys) if (pageQuery.has(key)) safePage.searchParams.set(key, pageQuery.get(key));
  const pageLocation = safePage.href;
  let pageReferrer = '';
  try { const ref = new URL(document.referrer); pageReferrer = ref.origin + ref.pathname; } catch {}
  const gaContext = { send_to: GA4_ID, page_location: pageLocation, page_referrer: pageReferrer };
  const item = { item_id: 'ranking-test', item_name: 'Etsy listing ranking test', price: 35, quantity: 1 };

        (function () {
            var IS_LOCAL = location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            if (IS_LOCAL) return;
            !function (f, b, e, v, n, t, s) {
                if (f.fbq) return; n = f.fbq = function () {
                    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                };
                if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
                n.queue = []; t = b.createElement(e); t.async = !0;
                t.src = v; s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s)
            }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1422152128860058');
            fbq('track', 'PageView');
            (function (c, l, a, r, i, t, y) {
                c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
                t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
                y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
            })(window, document, "clarity", "script", "tdx84puqbg");
        })();


        (function () {
            var IS_LOCAL = location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            if (IS_LOCAL) return;
            var g = document.createElement('script'); g.async = true;
            g.src = 'https://www.googletagmanager.com/gtag/js?id=AW-18518626177';
            document.head.appendChild(g);
            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { dataLayer.push(arguments); };
            gtag('js', new Date());
            gtag('config', 'AW-18518626177', { allow_enhanced_conversions: true });
            gtag('config', GA4_ID, { send_page_view: false, page_location: pageLocation, page_referrer: pageReferrer });
            gtag('event', 'page_view', { ...gaContext, page_title: document.title });
            !function (w, d) { if (!w.rdt) { var p = w.rdt = function () { p.sendEvent ? p.sendEvent.apply(p, arguments) : p.callQueue.push(arguments) }; p.callQueue = []; var t = d.createElement("script"); t.src = "https://www.redditstatic.com/ads/pixel.js", t.async = !0; var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(t, s) } }(window, document);
            rdt('init', 'a2_jv00dtxuyo8i', { useDecimalCurrencyValues: true });
            rdt('track', 'PageVisit');
        })();

  const destinations = {
    Contact: 'AW-18518626177/8myjCMmuh6AdEIGfr_5E',
    InitiateCheckout: 'AW-18518626177/_c5YCOGgh6AdEIGfr_5E',
    Lead: 'AW-18518626177/XstTCLiXh6AdEIGfr_5E'
  };
  window.erankerTrack = function (event, data = {}, continueNavigation) {
    if (!Object.hasOwn(destinations, event)) return;
    let navigationFinished = false;
    const finish = () => { if (!navigationFinished && continueNavigation) { navigationFinished = true; continueNavigation(); } };
    if (continueNavigation) setTimeout(finish, 250);
    try {
      const params = event === 'Lead' || event === 'InitiateCheckout' ? { value: 35, currency: 'USD' } : {};
      const gaEvent = { Lead: 'generate_lead', InitiateCheckout: 'begin_checkout', Contact: 'whatsapp_contact' }[event];
      const gaParams = { ...gaContext, ...params, method: event === 'Contact' ? 'whatsapp' : 'website' };
      if (event === 'InitiateCheckout') gaParams.items = [item];
      if (continueNavigation) { gaParams.event_callback = finish; gaParams.event_timeout = 250; }
      // GA4 receives no names, email, phone, listing URL, keywords or WhatsApp text.
      window.gtag?.('event', gaEvent, gaParams);
      window.dataLayer.push({ event: `eranker_${gaEvent}`, method: gaParams.method, ...params });
      window.fbq?.('track', event, params);
      if (event === 'Lead') {
        const id = window.crypto?.randomUUID?.() || String(Date.now());
        window.gtag?.('event', 'conversion', { send_to: destinations.Lead, ...params, transaction_id: id, transport_type: 'beacon', user_data: { email: data.email, phone_number: data.whatsapp } });
        window.rdt?.('track', 'Lead', { ...params, conversionId: id, email: data.email, phoneNumber: data.whatsapp });
      } else {
        window.rdt?.('track', 'Custom', { customEventName: event, ...params });
        window.gtag?.('event', 'conversion', { send_to: destinations[event], ...params, transport_type: 'beacon' });
      }
    } catch { finish(); /* Analytics must never interrupt checkout or contact delivery. */ }
  };
  document.querySelectorAll('[data-checkout]').forEach(link => {
    link.addEventListener('click', () => window.erankerTrack('InitiateCheckout'));
  });
})();
