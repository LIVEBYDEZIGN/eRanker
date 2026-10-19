eRanker website package | 18 October 2026

This ZIP contains Denis's 17 October website with Ion's 18 October edits.
Use index.html from THIS ZIP. Do not use an older preview or October 2 ZIP.

LATEST CHANGES, 18 October 2026
- Homepage proof explicitly identifies lifetime license users and thousands
  of rankings. The final sentence is: "Your trial proves the ranking:
  one listing, one keyword, page 1."
- reviews.html: removed the world-map and dog-collar proof cards.
- reviews.html: replaced the four generic rebuttals with three sourced
  responses, including the outside-traffic and Etsy marketplace explanation.
- Existing design, assets, forms and 17 October tracking tags are retained.
This package has not been published. The prior source ZIP remains unchanged.

PUBLISH
1. Keep the current live deploy available for rollback.
2. Extract this ZIP. Copy its contents into the root of LIVEBYDEZIGN/eRanker,
   replacing matching files and retaining the folder structure.
   index.html must remain at the repository root, not in an extra ZIP folder.
3. Include the entire assets folder, social proof assets folder, legal pages
   and tools/scheduler. The hero MP4 is included. No build command is needed.
4. Commit and push from your own GitHub account, using the existing connected
   production branch. Confirm the existing Netlify deployment finishes.
   No new project, account, DNS change or hosting change is needed.

WHAT IS INCLUDED
- Accepted design, existing brand fonts and colors, responsive mobile layout.
- Dark mode by default. Visitors can switch themes; their choice is remembered.
- Mobile order: headline, video, short explanation, main action.
- Muted hero video with poster, play/pause and sound controls.
- All-listings / multiple-keywords explanation and one-listing trial wording.
- New Ion portrait, visible proof and expandable additional seller stories.
- $499 option removed. Ranking Test and Full System remain.
- Accepted Full System graph and pricing-discussion wording.
- Existing HubSpot, WhatsApp, $35 checkout, social links and scheduler.

AFTER PUBLICATION
Open eranker.net in a fresh browser session on desktop and a phone. Check the
hero video, menu, trial form, proof expansion, FAQ, pricing and legal links.
The hero ends: "Try it on one listing first."
Confirm the homepage proof ends with the exact sentence above, and that
reviews.html contains three answers under "The 1-star reviews, answered".

The local audit used simulated form responses; it created no test lead or
payment. Confirm one authorized end-to-end form submission reaches HubSpot
and that the WhatsApp handoff opens with the supplied details. Check media
loading on the live host and an actual iPhone / Facebook browser as well.

ROLLBACK
Restore the previous successful Netlify deploy, or revert this upload commit.
Preserve the current production revision before upload. If production has
changed since Denis's 17 October ZIP, reconcile those changes before upload.

This is a static site. Existing third-party fonts, icons, Tailwind CDN,
YouTube proof embeds and remotely hosted images remain as before.
Do not upload internal preview, review, verification or archive directories.

UPDATE 17 October 2026 — ad tags only
- index.html <head>: Google Ads tag AW-18518626177 (enhanced conversions on)
  and Reddit Pixel a2_jv00dtxuyo8i (PageVisit). Meta Pixel and Clarity unchanged.
- On a successful trial-form save, next to the existing Meta "Lead":
  Reddit "Lead" and Google Ads conversion "Submit lead form"
  (AW-18518626177/XstTCLiXh6AdEIGfr_5E), $35, with email + WhatsApp for
  enhanced conversions / advanced matching.
- Meta "Contact" and "InitiateCheckout" are mirrored to Reddit as Custom events.
- privacy.html lists Google Ads and Reddit Pixel.
Nothing else changed. Tags are skipped on localhost/file preview by design.

UPDATE 17 October 2026 — reviews page + Google conversions
- New reviews.html (served as eranker.net/reviews): Fiverr and Trustpilot
  reviews, seller screenshots, videos (load on tap), answers to the 1-star
  reviews. Same tracking tags as the home page.
- New images: assets/reviews/ (2 page-1 screenshots + og-reviews.jpg, the link preview) and
  social proof assets/team/ion-2026-10-256.jpg (small copy of Ion's portrait).
- index.html: "Reviews" in the top menu (desktop + mobile), in the footer and under the Fiverr button.
  Google Ads conversions also fire for Contact-WhatsApp and Begin checkout,
  next to the existing Meta events.
- New robots.txt and sitemap.xml at the root (none existed before).
After publishing: open eranker.net/reviews, then submit sitemap.xml in
Google Search Console if you have access.
