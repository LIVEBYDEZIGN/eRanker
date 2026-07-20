eRanker website, handoff build
Generated 2026-07-20

OPEN OVER HTTP, NOT file://  (YouTube embeds throw "Error 153" on a file:// origin):
    python3 -m http.server 8901
    then http://localhost:8901/eranker-new%20design.html

TWO LAUNCH BLOCKERS
  1. Tailwind loads from the CDN (compiles in the browser, warns in console, FOUC, single point of
     failure). Needs a production/purged build producing one stylesheet.
  2. Local images under "social proof assets/" (spaces, %20) resolve locally; move to R2 or confirm
     they resolve on the host, or they 404 in prod.

PAYMENT LINKS (live, verified 2026-07-15)
  $35  "Test My Listing" -> 2-step form -> HubSpot -> payments-na1.hubspot.com/payments/qWyhzjgTVKqjxGQ
  $499 "Start Monthly"   -> straight to  payments-na1.hubspot.com/payments/DNQqTbKMYZY
  Every other CTA opens the form and ends at WhatsApp (deliberate: the trial is free for 2,000+-sales
  shops and only a human can check that, so those buttons must never hit a paywall).

TWO THINGS THAT LOOK LIKE BUGS AND ARE NOT
  - The <style> rule near line 128 deliberately overrides Tailwind text sizes on <p>/<li>/<h3> in a
    <section> (larger type for a 30+ audience). Intentional; reasoning is written above the rule.
  - The trailing semicolon on window.openAuditModal is load-bearing: without it the form silently
    breaks after one submission (no console error).

REMOTE DEPENDENCIES (not in this zip, already hosted)
  cdn.shopify.com
  cdn.tailwindcss.com
  code.iconify.design
  fonts.googleapis.com
  fonts.gstatic.com
  pub-dabf66908c8d4b128d4f88908ebce83a.r2.dev
  www.fiverr.com
  www.youtube-nocookie.com
  www.youtube.com

FILES (19)
  assets/etsy_cha_ching.mp3
  eranker-new design.html
  privacy.html
  social proof assets/team/dennis.jpg
  social proof assets/team/ion.jpg
  social proof assets/team/laura.jpg
  social proof assets/team/vince.jpg
  social proof assets/web/IMG_7732.jpeg
  social proof assets/web/IMG_7733.jpeg
  social proof assets/web/IMG_7734.jpeg
  social proof assets/web/IMG_7735.jpeg
  social proof assets/web/IMG_7736.jpeg
  social proof assets/web/IMG_7737.jpeg
  social proof assets/web/IMG_7738.jpeg
  social proof assets/web/IMG_7739.jpeg
  social proof assets/web/IMG_7741.jpeg
  social proof assets/web/IMG_7742.jpeg
  social proof assets/web/fiverr-profile.jpg
  terms.html
