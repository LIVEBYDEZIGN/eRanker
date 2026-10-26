# Intake-first release verification, 26 October 2026

## Final accepted package, including Google measurement and DNS instructions

Ion accepted his owner walkthrough and explicitly requested the final ZIP with real payment. Final production source is unchanged by the private payment simulation. The packaging checks confirm native HubSpot payment link 10567449, the unique form checkout redirect, and no simulator, QA page, test contact values or workflow-test message in site/.

Final checks: 33 flow/analytics tests passed. Seven content pages at eight widths (320, 360, 390, 430, 768, 1024, 1440, 1920), 56 combinations, passed with no horizontal overflow, out-of-viewport form controls or broken loaded images. New screenshots: release-mobile-form.png and release-desktop-form.png. Browser warning/error log was empty. Video completed at 36.899675 seconds with readyState 4 and no media error; FAQ and dark/light theme controls worked. All primary homepage checkout links point to checkout.html.

build-release.py verifies 70 local references, JavaScript syntax, GTM placement on all nine HTML files, required DNS/callback instructions, archive CRC and extracted byte equality. Final package: 42 files, 5,684,774 bytes, SHA-256 2346ae7abe4850e22ebdf0a69fa22c753326e8a1ddc2635258427e924a43070e. Includes site/, README-FOR-VADIM.md, DNS-FOR-VADIM.txt and RELEASE-MANIFEST.sha256 only. No verification/research files are distributed.

Owner's separate new submission was found as contact 257986054151 under the entered address pasledniaiabitva@gmai.com, explaining the unsuccessful search for @gmail.com. Listing /923123231, keywords ok / 0k 2 / kjhik and +37378328893 were present. This confirms new contact creation as well as the earlier existing-contact update. No contact edit was made during that lookup.

Public publication remains Vadim's action. README requires changing the prepared payment callback to https://eranker.net/payment-complete.html?checkout=complete with email forwarding enabled after upload. DNS-FOR-VADIM.txt contains the exact new Search Console TXT; preserve existing records. No public deployment, DNS mutation, charged transaction, paid association, GA4 report receipt or message delivery is claimed.

## Earlier verification

Scope: preserve the approved landing page and results, replace payment-first friction with one intake form, native HubSpot payment and automatic WhatsApp return. No eranker.net publication.

- Unit/flow checks: 29 passed (`flow.test.mjs`). JavaScript syntax and 66 local file references passed (`static-audit.json`, prior to adding one existing tracking.js reference on the return page).
- Form sizes: 320, 360, 375, 390, 430, 625, 768, 1024, 1280, 1920 in `responsive.json`; 1440 separately in `final-desktop.json`. No horizontal overflow. Small screens stack; desktop has two columns.
- Homepage/results: 320, 390, 768, 1440, no horizontal overflow or broken loaded images (`final-pages.json`). Approved content and assets retained.
- Blank submission: seven visible required-field errors, no redirect or external request. Default phone code +1, field placeholders are not input values. Completed test data does not prefill a fresh checkout.
- Actual hosted submission: all contact properties, unique native PAYMENT_LINK_FORM checkout and email visibly prefilled (`native-checkout.png`, `native-checkout.json`). DOM values were redacted, so email confirmation is visual.
- Fresh exact-email HubSpot search: one contact, 257843943044; updated with all seven values, no duplicate (`hubspot-final-readback.json`). This is an update to the existing authorized test contact, not a new paid contact.
- Actual saved payload with simulated checkout callback automatically opened wa.me for Laura, all details preserved (`hosted-whatsapp-return.json`). No extra site button. No Send/delivery claim.
- Recovery UI: `whatsapp-final.png`, WhatsApp logo and green Open WhatsApp button. Fixture was moved out of site/ before packaging.
- Prepared form is published with payment link 10567449. Prepared payment link has the security/next-step note and no redundant first-name custom field. Original public link 7124751 is untouched.
- Source uses local/session persistence with 24-hour TTL, canonical public host, failed save blocks checkout, trusted provider destination allowlist, no paid flag or Purchase event. Original analytics IDs retained and Lead/Contact hooks preserved.

Limits: payment completion was simulated, so no charged transaction, receipt email or paid association verification. Browser handoff is not WhatsApp delivery. Chromium responsive coverage is not physical iOS/Android/Safari wallet coverage. Public callback must be changed by Vadim after uploading the files; current private callback is intentionally retained until then.
