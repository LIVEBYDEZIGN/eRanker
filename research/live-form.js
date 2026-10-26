
        // --- eRanker APPLICATION FLOW (ported 1:1 from the live site's proven funnel) ---
        let currentStep = 1;
        const totalSteps = 2;

        /* ------------------------------------------------------------------------------------
         * $35 SELF-SERVE CHECKOUT
         *
         * PASTE THE HUBSPOT PAYMENT LINK HERE. While this is an empty string the "Test My Listing"
         * button falls back to the normal qualify flow (form -> WhatsApp), so it is never broken
         * and never sends anyone to a dead link. Setting it switches the button to checkout.
         *
         *   const RANKING_TEST_PAYMENT_URL = 'https://payments-na1.hubspot.com/payments/XXXXXXXX';
         *
         * ONLY the $35 pricing button uses this. The hero / header / main CTA deliberately keep the
         * WhatsApp qualification path: the trial is FREE for shops with 2,000+ lifetime sales, and
         * only Laura can check that. A paywall on those buttons would charge the sellers we promised
         * it to for free (~14.6% of leads qualify, and they are the ones worth having).
         * ------------------------------------------------------------------------------------ */
        // VERIFIED LIVE 2026-07-15 by loading the page: "ONE KEYWORD RANK", US$35.00. The checkout
        // itself instructs "Please use the same email address as the one provided in the submission
        // form", which is exactly the merge this flow depends on (HubSpot keys contacts on email).
        // NOTE: this checkout collects email + name-on-card ONLY, no WhatsApp number. The $35 path
        // keeps the full two-step form: it is the only place the number is captured, and the trial is
        // delivered over WhatsApp. Do not "simplify" step 2 away again.
        const RANKING_TEST_PAYMENT_URL = 'https://payments-na1.hubspot.com/payments/qWyhzjgTVKqjxGQ?referrer=PAYMENT_LINK';

        /** 'qualify' = form -> WhatsApp (every button). 'buy35' = form -> $35 checkout. */
        let modalMode = 'qualify';
        const HUBSPOT_PORTAL_ID = '48846766';
        const HUBSPOT_FORM_ID = 'd8187ec1-80b4-4a3a-a23e-ca2a51d97f4d';
        let whatsAppRedirectUrl = '';
        let isSubmitting = false;
        let leadSubmissionController = null;
        let leadSubmissionVersion = 0;

        function trackFb(eventName, params) {
            if (window.fbq) { params ? fbq('track', eventName, params) : fbq('track', eventName); }
            // Mirror Contact / InitiateCheckout to Reddit + Google; Lead goes through trackAdsLead (with matching).
            if (eventName === 'Lead') return;
            try {
                if (window.rdt) rdt('track', 'Custom', Object.assign({ customEventName: eventName }, params || {}));
                // beacon: checkout and WhatsApp can leave the page right after this call
                if (window.gtag && GADS_SEND_TO[eventName]) gtag('event', 'conversion', Object.assign({ send_to: GADS_SEND_TO[eventName], transport_type: 'beacon' }, params || {}));
            } catch (_) { }
        }

        // Google Ads conversion "Submit lead form" (primary), Goals > Conversions.
        const GADS_LEAD_SEND_TO = 'AW-18518626177/XstTCLiXh6AdEIGfr_5E';
        // Secondary conversions, fired from trackFb next to the Meta events of the same name.
        const GADS_SEND_TO = {
            Contact: 'AW-18518626177/8myjCMmuh6AdEIGfr_5E',          // Contact-WhatsApp
            InitiateCheckout: 'AW-18518626177/_c5YCOGgh6AdEIGfr_5E'  // Begin checkout
        };

        // Google Ads (enhanced conversions) + Reddit (advanced matching) Lead. Wrapped so a tracking
        // failure can never touch the HubSpot / WhatsApp / checkout flow.
        function trackAdsLead(email, whatsapp) {
            try {
                let phone = (whatsapp || '').replace(/[^\d+]/g, '').replace(/^00/, '+');
                if (phone && phone[0] !== '+') phone = '';
                const id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
                if (window.gtag) {
                    gtag('set', 'user_data', phone ? { email: email, phone_number: phone } : { email: email });
                    if (GADS_LEAD_SEND_TO) gtag('event', 'conversion', { send_to: GADS_LEAD_SEND_TO, value: 35, currency: 'USD', transaction_id: id });
                }
                if (window.rdt) rdt('track', 'Lead', { value: 35, currency: 'USD', conversionId: id, email: email, phoneNumber: phone || undefined });
            } catch (e) { console.error('ads tracking failed:', e); }
        }

        function fieldVal(id) { return (document.getElementById(id).value || '').trim(); }

        function markInvalid(input) {
            input.classList.add('field-invalid');
            input.style.setProperty('border-color', '#f87171', 'important');
            input.style.setProperty('box-shadow', '0 0 0 3px rgba(248, 113, 113, 0.12)', 'important');
            // A red border is colour ONLY: invisible to colour-blind users (~8% of men) and silent to
            // every screen reader, so the form just refuses to advance with no stated reason.
            // aria-invalid states that it failed; aria-describedby points at why.
            input.setAttribute('aria-invalid', 'true');
            var err = document.getElementById(input.id + '-error');
            if (err) {
                err.classList.remove('hidden');
                input.setAttribute('aria-describedby', err.id);
            }
            input.addEventListener('input', () => {
                input.classList.remove('field-invalid');
                input.style.removeProperty('border-color');
                input.style.removeProperty('box-shadow');
                input.removeAttribute('aria-invalid');
                var e2 = document.getElementById(input.id + '-error');
                if (e2) e2.classList.add('hidden');
            }, { once: true });
        }

        function focusFirstInvalid() {
            var el = document.querySelector('.form-step:not(.hidden) .field-invalid');
            if (el) el.focus();
        }

        function updateModalUI() {
            const steps = document.querySelectorAll('.form-step');
            const progressBar = document.getElementById('audit-progress');
            const backBtn = document.getElementById('btn-back');
            const nextBtn = document.getElementById('btn-next');
            const indicator = document.getElementById('step-indicator');
            const footer = document.getElementById('audit-footer');

            if (currentStep === 'success') {
                steps.forEach(el => el.classList.add('hidden'));
                document.querySelector('[data-step="success"]').classList.remove('hidden');
                if (footer) footer.style.display = 'none';
                if (progressBar) progressBar.style.width = '100%';
                return;
            }

            steps.forEach(el => {
                if (el.dataset.step == currentStep) {
                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
            });

            if (progressBar) progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;

            if (footer) footer.style.display = 'flex';

            if (backBtn) {
                if (currentStep === 1) backBtn.classList.add('hidden');
                else backBtn.classList.remove('hidden');
            }

            if (nextBtn) {
                nextBtn.disabled = false;
                if (modalMode === 'buy35' && currentStep === totalSteps) {
                    nextBtn.innerHTML = 'Continue to payment <iconify-icon icon="lucide:arrow-right" width="14"></iconify-icon>';
                } else if (currentStep === totalSteps) {
                    nextBtn.innerHTML = 'Start My Test <iconify-icon icon="lucide:check" width="14"></iconify-icon>';
                } else {
                    nextBtn.innerHTML = 'Continue <iconify-icon icon="lucide:arrow-right" width="14"></iconify-icon>';
                }
            }
        }

        function validateStep1() {
            let valid = true;
            const listing = document.getElementById('f-listing');
            const listingError = document.getElementById('f-listing-error');
            // Requires an Etsy listing URL on any country domain (with optional shop
            // subdomain in front) followed by /listing/ and the numeric listing ID.
            // Passes: etsy.com/listing/123, www.etsy.com/listing/123, etsy.co.uk/listing/123,
            // shopname.etsy.co.uk/listing/123. Rejects short links (etsy.me/...) that carry no ID.
            if (!/etsy\.[a-z]{2,3}(?:\.[a-z]{2})?(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/listing\/\d+/i.test(listing.value.trim())) {
                valid = false;
                markInvalid(listing);
                listingError.classList.remove('hidden');
            } else {
                listingError.classList.add('hidden');
            }
            ['f-kw1', 'f-kw2', 'f-kw3'].forEach(id => {
                const input = document.getElementById(id);
                if (!input.value.trim()) { valid = false; markInvalid(input); }
            });
            return valid;
        }

        function validateStep2() {
            let valid = true;
            const name = document.getElementById('f-name');
            const email = document.getElementById('f-email');
            const wa = document.getElementById('f-wa');
            const waError = document.getElementById('f-wa-error');
            if (!name.value.trim()) { valid = false; markInvalid(name); }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { valid = false; markInvalid(email); }
            // Clean spaces, dashes, parentheses, dots out of the number before checking,
            // and write the cleaned version back so it submits and messages clean.
            let waClean = wa.value.replace(/[\s\-().]/g, '');
            // "00" is the international dialling prefix across Europe and most of the world.
            // 0040712345678 IS +40712345678. Normalise it; rejecting it turned away real leads.
            waClean = waClean.replace(/^00(?=[1-9])/, '+');
            wa.value = waClean;
            if (!/^\+[1-9]\d{1,14}$/.test(waClean)) {
                valid = false;
                markInvalid(wa);
                waError.classList.remove('hidden');
            } else {
                waError.classList.add('hidden');
            }
            return valid;
        }

        // Live "listing detected" tick on the Etsy URL field
        (function () {
            var lf = document.getElementById('f-listing');
            var tick = document.getElementById('f-listing-tick');
            if (!lf || !tick) return;
            var re = /etsy\.[a-z]{2,3}(?:\.[a-z]{2})?(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/listing\/\d+/i;
            lf.addEventListener('input', function () {
                var ok = re.test(lf.value.trim());
                tick.classList.toggle('hidden', !ok);
                if (ok) { var err = document.getElementById('f-listing-error'); if (err) err.classList.add('hidden'); }
            });
        })();

        async function submitLead() {
            const submitError = document.getElementById('f-submit-error');
            const nextBtn = document.getElementById('btn-next');
            submitError.classList.add('hidden');
            isSubmitting = true;
            nextBtn.disabled = true;
            nextBtn.innerHTML = 'Submitting...';

            // FORM-HARDENING FLAG #3 (2026-07-13): build the WhatsApp link BEFORE the network call,
            // so an ad-blocker that blocks HubSpot never strands the lead. The WhatsApp message carries
            // every field, so Laura receives the lead even if the HubSpot save is blocked. REVERT: move
            // this back inside the success branch and restore the catch branch to show f-submit-error.
            // Both paths run the same two-step form and send the same fields. The ONLY difference
            // is the destination: qualify -> WhatsApp screen, buy35 -> $35 checkout.
            const submissionVersion = ++leadSubmissionVersion;
            let saveConfirmed = false;
            const controller = new AbortController();
            leadSubmissionController = controller;
            const submissionTimeout = setTimeout(() => controller.abort(), 12000);
            const isBuy = modalMode === 'buy35';
            const leadEmail = fieldVal('f-email');

            const message = `listing id: ${fieldVal('f-listing')}\nkeyword 1: ${fieldVal('f-kw1')}\nkeyword 2: ${fieldVal('f-kw2')}\nkeyword 3: ${fieldVal('f-kw3')}\nname: ${fieldVal('f-name')}\nemail: ${leadEmail}\nwhatsapp: ${fieldVal('f-wa')}`;
            whatsAppRedirectUrl = `https://wa.me/13057966231?text=${encodeURIComponent(message)}`;

            try {
                const response = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`, {
                    method: 'POST',
                    signal: controller.signal,
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        submittedAt: Date.now(),
                        fields: [
                            { objectTypeId: '0-1', name: 'etsy_listing_url', value: fieldVal('f-listing') },
                            { objectTypeId: '0-1', name: 'target_keyword', value: fieldVal('f-kw1') },
                            { objectTypeId: '0-1', name: 'keyword_2', value: fieldVal('f-kw2') },
                            { objectTypeId: '0-1', name: 'keyword_3', value: fieldVal('f-kw3') },
                            { objectTypeId: '0-1', name: 'email', value: leadEmail },
                            { objectTypeId: '0-1', name: 'firstname', value: fieldVal('f-name') },
                            // The $35 checkout does NOT collect a WhatsApp number, so this form is the
                            // only place it is captured. Removing step 2 left a paying customer with no
                            // contactable number, on a product delivered over WhatsApp.
                            { objectTypeId: '0-1', name: 'hs_whatsapp_phone_number', value: fieldVal('f-wa') }
                        ],
                        context: {
                            hutk: document.cookie.match(/hubspotutk=([^;]+)/)?.[1] || undefined,
                            pageUri: window.location.href,
                            pageName: document.title
                        }
                    })
                });
                if (!response.ok) throw new Error('Submission failed');
                saveConfirmed = true;
                trackFb('Lead', { value: 35, currency: 'USD' });
                trackAdsLead(leadEmail, fieldVal('f-wa'));
            } catch (err) {
                // Do not strand the lead. Qualify path: WhatsApp still carries every field.
                // Buy path: let them pay anyway. A blocked HubSpot loses the keywords (Laura can
                // ask); blocking checkout loses the sale.
                console.error('HubSpot submit failed:', err);
            } finally {
                clearTimeout(submissionTimeout);
                if (submissionVersion === leadSubmissionVersion) {
                    isSubmitting = false;
                    leadSubmissionController = null;
                }
            }

            // A closed dialog must not later change a newly opened form or redirect it.
            if (submissionVersion !== leadSubmissionVersion) return;
            if (isBuy) {
                // Preserve the existing checkout policy: attempt the save first, then hand off.
                // A failed save still proceeds to payment; this is not proof of CRM delivery.
                trackFb('InitiateCheckout', { value: 35, currency: 'USD' });
                // Prefill the checkout email with the FORM email. HubSpot only merges the payment
                // onto the form contact when the two emails MATCH; Apple Pay / Stripe Link autofill
                // silently substitutes the wallet email, splitting the buyer into two contacts
                // (live case 2026-08-10: form onurilgaz011@ 11:18, payment vesparastudio@ 11:22,
                // deal named "Unknown", ~1 in 6 paid trials). Prefill verified live: the checkout
                // carries ?email= through to its session and fills the field.
                window.location.href = RANKING_TEST_PAYMENT_URL + '&email=' + encodeURIComponent(leadEmail);
                return;
            }

            goToSuccess(saveConfirmed);
        }

        function goToSuccess(saveConfirmed = true) {
            if (window.showLeadResult) window.showLeadResult(saveConfirmed);
            const link = document.getElementById('wa-chat-link');
            if (link && whatsAppRedirectUrl) link.href = whatsAppRedirectUrl;
            currentStep = 'success';
            updateModalUI();
        }

        // FORM-HARDENING FLAG #1 (2026-07-13): the success button is now a real anchor; this only
        // fires the Contact pixel and intentionally does NOT close the modal or reset the form, so a
        // tap blocked by an in-app browser can be retried. REVERT: restore openWhatsApp() below and the
        // <button onclick="openWhatsApp()"> in the success screen.
        // function openWhatsApp() {
        //     trackFb('Contact');
        //     if (whatsAppRedirectUrl) window.open(whatsAppRedirectUrl, '_blank');
        //     closeAuditModal();
        //     resetLeadForm();
        // }
        function onWhatsAppClick() {
            trackFb('Contact');
        }

        // Full System tier: no form, straight to the conversation (license-intent lead,
        // clearly labeled for Laura/Ion the moment they hit send).
        function openFullSystemChat() {
            trackFb('Contact');
            const msg = "Hi! I'm interested in the eRanker Full System (unlimited rankings) for my shop. Can we talk?";
            window.open('https://wa.me/13057966231?text=' + encodeURIComponent(msg), '_blank');
        }

        /** Entry point for the $35 pricing button. Falls back to the qualify flow when no link is set.
         *  ORDER IS LOAD-BEARING: openAuditModal() is wrapped and calls resetLeadForm(), which sets
         *  modalMode back to 'qualify'. So the mode MUST be set AFTER the open, then re-rendered.
         *  Setting it first looks correct and silently does nothing (caught in test, 2026-07-15). */
        function openRankingTestCheckout() {
            openAuditModal();
            modalMode = RANKING_TEST_PAYMENT_URL ? 'buy35' : 'qualify';
            updateModalUI();
        }

        function resetLeadForm() {
            ['f-listing', 'f-kw1', 'f-kw2', 'f-kw3', 'f-name', 'f-email', 'f-wa'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            whatsAppRedirectUrl = '';
            currentStep = 1;
            modalMode = 'qualify';
            updateModalUI();
        }

        function nextStep() {
            if (isSubmitting) return;
            if (currentStep === 1) {
                if (!validateStep1()) { focusFirstInvalid(); return; }
                currentStep = 2;
                updateModalUI();
            } else if (currentStep === 2) {
                if (!validateStep2()) { focusFirstInvalid(); return; }
                submitLead();
            }
        }

        function prevStep() {
            if (currentStep > 1 && currentStep !== 'success') {
                currentStep--;
                updateModalUI();
            }
        }

        // Overwrite openAuditModal to reset form (clears stale field values on each fresh open,
        // since the WhatsApp tap no longer auto-resets, per FORM-HARDENING FLAG #1).
        window.originalOpenAuditModal = window.openAuditModal;
        // The trailing semicolon is load-bearing. Without it, ASI does NOT insert one before the
        // "(" that opens the next IIFE, so this whole assignment parses as a CALL instead. The wrapper
        // then never installs, openAuditModal silently stays the un-wrapped original, resetLeadForm()
        // never runs on open, and the form is stuck on the success screen for the rest of the session
        // after a single submission. It fails without throwing, so nothing in the console warns you.
        window.openAuditModal = function () {
            if (typeof resetLeadForm === 'function') resetLeadForm();
            else currentStep = 1;
            if (window.originalOpenAuditModal) window.originalOpenAuditModal();
        };

        // Enter key advances the form (like people expect), except inside a textarea.
        (function () {
            const form = document.getElementById('multi-step-form');
            if (!form) return;
            form.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                    e.preventDefault();
                    nextStep();
                }
            });
        })();

        // --- PROOF: MORE USER STORIES TOGGLE ---
        function toggleMoreStories() {
            const box = document.getElementById('more-user-stories');
            const label = document.getElementById('more-stories-label');
            const icon = document.getElementById('more-stories-icon');
            if (box.classList.contains('hidden')) {
                box.classList.remove('hidden');
                box.classList.add('grid');
                label.textContent = 'Show fewer';
                icon.setAttribute('icon', 'lucide:chevron-up');
            } else {
                box.classList.add('hidden');
                box.classList.remove('grid');
                label.textContent = 'More user stories';
                icon.setAttribute('icon', 'lucide:chevron-down');
            }
        }

        // --- MOBILE MENU ---
        const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
            document.querySelectorAll('.mobile-menu-link').forEach(link => {
                link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
            });
        }

        // --- CHA-CHING PROXIMITY SOUND (overlapping dings) ---
        // While the block is near the viewport center, cha-chings spawn every
        // 0.55-1.15s and OVERLAP (WebAudio buffer voices with slight pitch
        // variation, all under one proximity-driven master gain: quiet on
        // approach, full at center, fading as you scroll past). Fallback for
        // ancient browsers: overlapping <audio> clones. Browsers block ALL audio
        // until the first user interaction; the button is the guaranteed unlock.
        const chaAudio = document.getElementById('chaching-audio');
        const chaBtn = document.getElementById('chaching-sound-btn');
        const chaLabel = document.getElementById('chaching-sound-label');
        const chaSection = document.getElementById('app');
        let chaEnabled = false;
        let chaUnlocked = false;
        let chaCtx = null;
        let chaMaster = null;
        let chaBuffer = null;
        let chaLoadingBuffer = false;
        let chaLoopTimer = null;
        let chaTicking = false;

        function chaProximity() {
            if (!chaSection) return 0;
            const r = chaSection.getBoundingClientRect();
            const vh = window.innerHeight;
            const d = Math.abs((r.top + r.height / 2) - vh / 2);
            const range = ((vh + r.height) / 2) * 1.15;
            return Math.max(0, Math.min(1, 1 - d / range));
        }

        function chaEnv() {
            return Math.pow(chaProximity(), 1.6) * 0.65;
        }

        function chaEnsureCtx() {
            if (chaCtx) return;
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            try {
                chaCtx = new AC();
                chaMaster = chaCtx.createGain();
                chaMaster.gain.value = chaEnv();
                chaMaster.connect(chaCtx.destination);
            } catch (e) { chaCtx = null; chaMaster = null; }
        }

        function chaLoadBuffer() {
            if (chaBuffer || chaLoadingBuffer || !chaCtx) return;
            chaLoadingBuffer = true;
            fetch('assets/etsy_cha_ching.mp3')
                .then(r => r.arrayBuffer())
                .then(ab => chaCtx.decodeAudioData(ab))
                .then(buf => { chaBuffer = buf; })
                .catch(() => { chaLoadingBuffer = false; });
        }

        function chaSpawnDing() {
            if (!chaEnabled) return;
            chaEnsureCtx();
            if (chaCtx) {
                if (chaCtx.state === 'suspended') chaCtx.resume().catch(() => { });
                chaLoadBuffer();
                if (chaCtx.state === 'running' && chaBuffer) {
                    const src = chaCtx.createBufferSource();
                    src.buffer = chaBuffer;
                    src.playbackRate.value = 0.95 + Math.random() * 0.1;
                    src.connect(chaMaster);
                    src.start();
                    chaUnlocked = true;
                    chaUpdateLabel(true);
                    return;
                }
            }
            if (chaAudio) {
                const clone = chaAudio.cloneNode(true);
                clone.volume = Math.max(0, Math.min(1, chaEnv()));
                clone.play().then(() => { chaUnlocked = true; chaUpdateLabel(true); }).catch(() => { });
            }
        }

        function chaLoopStep() {
            chaLoopTimer = null;
            if (chaProximity() > 0.08 && chaEnabled && !document.hidden) {
                chaSpawnDing();
                chaLoopTimer = setTimeout(chaLoopStep, 550 + Math.random() * 600);
            }
        }

        function chaStartLoop() {
            if (!chaLoopTimer) chaLoopStep();
        }

        function chaStopLoop() {
            if (chaLoopTimer) { clearTimeout(chaLoopTimer); chaLoopTimer = null; }
        }

        function chaTick() {
            chaTicking = false;
            if (chaMaster) chaMaster.gain.value = chaEnv();
            if (chaProximity() > 0.08 && chaEnabled && !document.hidden) chaStartLoop();
            else chaStopLoop();
        }

        function chaRequestTick() {
            if (!chaTicking) { chaTicking = true; requestAnimationFrame(chaTick); }
        }

        function chaUpdateLabel(playedOnce) {
            if (!chaBtn || !chaLabel) return;
            const icon = chaBtn.querySelector('iconify-icon');
            if (!chaEnabled) {
                if (icon) icon.setAttribute('icon', 'lucide:volume-x');
                chaLabel.textContent = 'Hear the Cha-Ching';
            } else {
                if (icon) icon.setAttribute('icon', 'lucide:volume-2');
                chaLabel.textContent = playedOnce ? 'Mute sound' : 'Hear the Cha-Ching';
            }
        }

        if (chaBtn && chaAudio && chaSection) {
            chaBtn.addEventListener('click', () => {
                if (!chaEnabled) {
                    chaEnabled = true;
                    localStorage.setItem('chaching-sound', 'on');
                    chaUpdateLabel(false);
                    chaSpawnDing();
                    chaRequestTick();
                } else if (!chaUnlocked) {
                    // First click while the label still says "Hear the Cha-Ching":
                    // always PLAY, never mute.
                    chaSpawnDing();
                    chaRequestTick();
                } else {
                    chaEnabled = false;
                    localStorage.setItem('chaching-sound', 'off');
                    chaUpdateLabel(false);
                    chaStopLoop();
                }
            });
            chaUpdateLabel(false);
            window.addEventListener('scroll', chaRequestTick, { passive: true });
            window.addEventListener('resize', chaRequestTick, { passive: true });
            document.addEventListener('visibilitychange', () => { if (document.hidden) chaStopLoop(); });
            // Sound starts only from the dedicated sound button.
            chaRequestTick();
        }
    