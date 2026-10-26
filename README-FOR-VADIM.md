# eRanker release: details, payment, WhatsApp

26 October 2026. Final approved intake-first release with real HubSpot payment, automatic WhatsApp handoff, GA4 and GTM. This ZIP supersedes the earlier packages from today. Upload `site/`, never the owner-private payment-simulated preview. The public website has not been replaced yet.

## Publish

1. Upload the contents of `site/` to the website root, keeping relative paths. No build is required. Keep the previous release for rollback.
2. Verify `https://eranker.net/checkout.html` and `https://eranker.net/payment-complete.html` load. Use HTTPS and the canonical eranker.net host. The checkout and return pages normalize www to that host so saved details survive payment.
3. In HubSpot portal **48846766**, open payment link **10567449**, **Website paid ranking test $35**. Change its after-payment redirect to **https://eranker.net/payment-complete.html?checkout=complete**. Keep **include customer's email in redirect URL** enabled. Save and read back the exact URL. It currently points to the owner-private preview, so this cutover is required.
4. Verify the existing published form **5e37ba79-2b57-4acd-892b-ea180b6a14aa**, **Paid ranking test setup (3 keywords)**, still has Payment enabled with link **10567449**. No new form is needed. Its native payment association is required, not a generic payment-link redirect.
5. Check a complete customer journey with Laura after deployment. The old free-trial WhatsApp automation should not take over the new paid-test conversation; coordinate that change with her existing quick replies. This package does not modify ManyChat or send messages automatically.
6. Add the Search Console TXT record from `DNS-FOR-VADIM.txt` to the Cloudflare DNS for eranker.net, preserving the existing TXT records. Ion assigned this to Vadim at publication. It has not been added yet.
7. Check GA4 Realtime and Tag Assistant after publication. GA4 **G-FQ5CDMGQ6G** is configured directly in tracking.js. GTM **GTM-WLTZBCJ4** is installed on all pages; its current published container is empty. Do not add duplicate GA4 tags to GTM without removing the equivalent direct sender. Event mapping is below.

## Customer journey

One website form collects listing, three keyword choices, name, email and WhatsApp number. Country code starts at +1 and is selectable. HubSpot saves those details before payment and returns a unique form-linked checkout with the email prefilled. The redundant custom first-name field has been removed from this prepared payment link. Native cardholder name is still part of card payment.

After HubSpot returns, the website automatically opens WhatsApp addressed to **+1 305 796 6231** with all details in the message. The customer taps Send in WhatsApp. The green WhatsApp screen is recovery if the browser prevents app handoff, not another required website step. Saved details survive reload and checkout Back for 24 hours. If browser storage is unavailable, checkout is stopped before redirect; if a payment return arrives without its saved details, the message asks Laura to find the submission by checkout email.

## HubSpot mapping

| Website | Contact property |
|---|---|
| Listing | etsy_listing_url |
| Keyword 1 | target_keyword |
| Keyword 2 | keyword_2 |
| Keyword 3 | keyword_3 |
| Name | firstname |
| Email | email |
| WhatsApp | hs_whatsapp_phone_number |

The submission also includes native payment_link_id **10567449** (object type 0-0). Payment confirmation comes from HubSpot, not a customer-edited URL or WhatsApp message. The client code writes no paid property and fires no Purchase event. Existing analytics IDs and Lead/Contact/InitiateCheckout events are retained. The ordinary website form is a lead before payment; Laura must use HubSpot payment status to confirm payment. Changing the email inside checkout could change the associated contact, so do not claim immutable identity matching.

The prepared checkout notice is saved as: “Secure payment through HubSpot. eRanker never receives your full card number or security code. After payment, continue to WhatsApp to send Laura your saved test details.”

## Google events

| Meta | GA4 | Trigger |
|---|---|---|
| PageView | page_view | Content page loaded |
| InitiateCheckout | begin_checkout | Test CTA selected |
| Lead | generate_lead | HubSpot confirms saved details and returns its checkout |
| Contact | whatsapp_contact | WhatsApp handoff starts |

GA4 receives no names, emails, phone numbers, listing URLs, keywords or message text. Local/private previews do not send analytics. The corresponding GTM dataLayer hooks are eranker_begin_checkout, eranker_generate_lead and eranker_whatsapp_contact. Mark generate_lead as a GA4 key event if needed. A purchase event requires verified payment data and a transaction ID; never generate it from the return URL. whatsapp_contact records opening the conversation, not message delivery.

## Verified and limits

33 automated checks passed, including malformed inputs, phone normalization, timeout/error handling, trusted checkout destination, message encoding, storage expiry, contact-email isolation and Google event dispatch. Final responsive check: all seven content pages at 320, 360, 390, 430, 768, 1024, 1440 and 1920px, 56 page/size combinations, with no horizontal overflow or fields outside the viewport. Local file references, JavaScript syntax and archive/source equality passed. These are Chromium responsive checks, not a claim of physical testing on every device.

An actual submission on the owner-private preview updated exactly one HubSpot contact for the authorized test email; all seven contact properties were read back. The native HubSpot checkout displayed the prefilled email and new security notice. A simulated return through the configured callback automatically reached WhatsApp with those same submitted details. No real charge, receipt delivery, paid-contact association or incoming WhatsApp Send was performed. Native wallet availability, including Apple Pay, depends on the device, browser and provider; no Apple Pay transaction was tested.

Ion accepted his owner-private walkthrough; the matching new contact was found in HubSpot with the entered email, listing, three keywords and WhatsApp. Payment alone was simulated there. This ZIP uses the production source and requires the real HubSpot payment.

There is no payment bypass, simulator, QA fixture, or test-message prefix in `site/`. Test evidence stays outside this ZIP. Original public payment link **7124751** was not changed. If the payment return or form fails after deployment, restore the matching previous website and payment callback together.
