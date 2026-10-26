# Google measurement setup, 26 October 2026

## Implemented in the production candidate

- GA4: G-FQ5CDMGQ6G. One explicit page_view per content page.
- GTM: GTM-WLTZBCJ4. Head script and immediate-after-body noscript iframe on all nine HTML documents, including compatibility pages and transcript.
- The downloaded live GTM container is version 1 with zero tags. GA4 is therefore configured once in tracking.js, alongside the existing Google Ads tag. Do not add a duplicate GA4 page-view or event tag to GTM without removing the equivalent direct sender.
- Existing Meta/Google Ads/Reddit/Clarity IDs remain. Google Ads user_data is scoped to its conversion event, not set globally for GA4.
- GA4 gets no email, phone, listing URL, keyword, or WhatsApp message. Page URLs keep only campaign attribution parameters; referrer queries are stripped. The WhatsApp recovery link keeps a clean public href and constructs the full message only when activated, preventing enhanced outbound-click collection of the message text.

| Existing Meta event | GA4 event | Trigger |
|---|---|---|
| PageView | page_view | Content page loaded |
| InitiateCheckout | begin_checkout | Test CTA selected |
| Lead | generate_lead | HubSpot confirms the intake and returns its native checkout |
| Contact | whatsapp_contact | WhatsApp handoff starts |

Checkout carries USD35 and one ranking-test item. Lead retains the existing USD35 lead-value convention, not paid revenue. No purchase or paid event is generated from the return URL, simulated payment, or WhatsApp message. A real purchase event needs verified payment data and transaction ID. whatsapp_contact means opening the conversation, not message delivery.

GTM dataLayer also receives eranker_begin_checkout, eranker_generate_lead and eranker_whatsapp_contact without personal details. These are hooks for future container configuration, not extra GA4 senders. On automatic handoff, the existing analytics queue gets at most 250ms; navigation proceeds once even if analytics is blocked.

## Verification and limits

33 tests pass: 29 intake/storage/redirect cases plus four analytics cases covering IDs, one pageview, event parity, personal-data exclusion, preview silence and navigation fallback. GTM snippet placement and syntax/local links checked. The owner-private deployment intentionally suppresses analytics, including the noscript iframe, so test activity does not appear as customers. No claim of receipt in GA4 Realtime, Google Ads reports or a live-public eranker.net visit is made. Denis can mark generate_lead as a GA4 key event and verify Realtime/Tag Assistant after public deployment; property-admin access was not supplied.

The supplied Search Console TXT record is prepared in DNS-FOR-VADIM.txt but is absent from current public DNS. Ion confirmed Vadim will add it at publication; no DNS change or verification claimed. Preserve the two existing Google TXT records and all other DNS records.

## Owner walkthrough

Private builder: build-owner-preview.py. It copies the production source and changes only the private transition after actual HubSpot save to simulate the payment return. A small preview notice states no charge; the returned screen states payment simulated. No test prefix is added to the WhatsApp message. Production source still redirects to the unique native HubSpot checkout and contains no payment bypass. Do not distribute the private dist directory.

## Primary documentation

- GA4 events: https://developers.google.com/analytics/devguides/collection/ga4/events
- Recommended event fields: https://developers.google.com/analytics/devguides/collection/ga4/reference/events
- Explicit Google destination routing: https://developers.google.com/tag-platform/gtagjs/routing
- Search Console DNS verification: https://support.google.com/webmasters/answer/9008080
- Native payment verification limits: https://knowledge.hubspot.com/payment-links/create-and-share-a-products-payment-link
