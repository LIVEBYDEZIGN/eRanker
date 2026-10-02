/* Review-only interaction repairs. Offer copy and commercial routing stay unchanged. */
(() => {
  'use strict';
  const heroVideo = document.getElementById('hero-video-player');
  if (heroVideo) {
    // The file fades to an empty last frame. Reveal its cover at the end and
    // restore the video when replay starts; a normal pause keeps its frame.
    const syncHeroCover = () => {
      heroVideo.style.visibility = heroVideo.ended || heroVideo.error ? 'hidden' : '';
    };
    ['ended', 'error', 'play', 'playing', 'loadeddata'].forEach(event => {
      heroVideo.addEventListener(event, syncHeroCover);
    });
    syncHeroCover();
  }
  const dialog = document.getElementById('audit-modal');
  const form = document.getElementById('multi-step-form');
  const menu = document.getElementById('mobile-menu');
  const menuButton = document.getElementById('mobile-menu-toggle');
  const closeButton = dialog.querySelector('button[onclick="closeAuditModal()"]');
  closeButton.setAttribute('aria-label', 'Close signup form');
  closeButton.type = 'button';

  const fieldErrors = {
    'f-kw1': 'Enter a search phrase for this listing.',
    'f-kw2': 'Add a second search phrase for the same listing.',
    'f-kw3': 'Add a third search phrase for the same listing.',
    'f-name': 'Enter your name.',
    'f-email': 'Enter a valid email address, like name@example.com.'
  };
  Object.entries(fieldErrors).forEach(([id, text]) => {
    const error = document.createElement('p');
    error.id = `${id}-error`;
    error.className = 'hidden review-field-error';
    error.textContent = text;
    error.setAttribute('aria-live', 'polite');
    document.getElementById(id).after(error);
  });
  [['f-name', 'name'], ['f-email', 'email'], ['f-wa', 'tel']].forEach(([id, value]) => {
    document.getElementById(id).autocomplete = value;
  });
  const listing = document.getElementById('f-listing');
  listing.inputMode = 'url';
  listing.autocapitalize = 'off';
  listing.spellcheck = false;
  document.getElementById('f-email').autocapitalize = 'off';
  document.getElementById('f-email').spellcheck = false;

  let trigger = null;
  let previousOverflow = '';
  let previousStep = null;
  let background = [];
  const isOpen = () => !dialog.classList.contains('hidden');
  const focusable = () => [...dialog.querySelectorAll('button,a[href],input,[tabindex="0"]')]
    .filter(el => !el.disabled && !el.inert && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  const restoreBackground = () => {
    background.forEach(([el, wasInert]) => { el.inert = wasInert; });
    background = [];
  };

  const originalReset = window.resetLeadForm;
  window.resetLeadForm = () => {
    form.querySelectorAll('input').forEach(input => {
      input.classList.remove('field-invalid');
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      input.style.removeProperty('border-color');
      input.style.removeProperty('box-shadow');
    });
    form.querySelectorAll('[id$="-error"]').forEach(el => el.classList.add('hidden'));
    document.getElementById('f-listing-tick').classList.add('hidden');
    document.getElementById('wa-chat-link').setAttribute('href', '#');
    previousStep = null;
    originalReset();
  };

  const originalOpen = window.openAuditModal;
  window.openAuditModal = () => {
    trigger = document.activeElement;
    previousOverflow = document.body.style.overflow;
    menu.classList.add('hidden');
    syncMenu();
    originalOpen();
    background = [...document.body.children]
      .filter(el => el !== dialog && !['SCRIPT', 'STYLE', 'LINK'].includes(el.tagName))
      .map(el => [el, el.inert]);
    background.forEach(([el]) => { el.inert = true; });
  };

  window.closeAuditModal = () => {
    if (!isOpen()) return;
    ++leadSubmissionVersion;
    if (leadSubmissionController) leadSubmissionController.abort();
    leadSubmissionController = null;
    isSubmitting = false;
    const content = document.getElementById('audit-modal-content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    restoreBackground();
    // No delayed close callback that could hide a newly reopened dialog.
    dialog.classList.add('hidden');
    document.body.style.overflow = previousOverflow;
    if (trigger?.isConnected) trigger.focus({preventScroll: true});
  };
  const originalBack = window.prevStep;
  window.prevStep = () => { if (!isSubmitting) originalBack(); };
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const items = focusable();
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first?.focus();
    }
  });

  const originalUpdate = window.updateModalUI;
  window.updateModalUI = () => {
    originalUpdate();
    const active = form.querySelector('.form-step:not(.hidden)');
    const step = active?.dataset.step;
    if (step !== previousStep) {
      previousStep = step;
      const heading = active?.querySelector('h4');
      if (heading) heading.tabIndex = -1;
      if (isOpen()) {
        dialog.querySelector('.overflow-y-auto').scrollTop = 0;
        heading?.focus({preventScroll: true});
      }
    }
    document.getElementById('btn-back').disabled = isSubmitting;
  };

  // Preserve the WhatsApp fallback, but never imply a failed save was received.
  const result = form.querySelector('[data-step="success"]');
  const resultHeading = result.querySelector('h4');
  const resultCopy = result.querySelector('.text-base.font-semibold');
  const originalResultCopy = resultCopy.textContent;
  const resultIcon = result.querySelector('iconify-icon');
  window.showLeadResult = confirmed => {
    result.dataset.saveConfirmed = String(confirmed);
    resultHeading.textContent = confirmed ? 'Information Submitted Successfully!' : 'Continue with Laura on WhatsApp';
    resultCopy.textContent = confirmed ? originalResultCopy :
      "We couldn't save your form. Your details are ready in the WhatsApp message. Open the chat and tap Send so Laura can receive them.";
    resultIcon.setAttribute('icon', confirmed ? 'lucide:check' : 'lucide:message-circle');
  };

  function syncMenu() {
    const expanded = !menu.classList.contains('hidden');
    menuButton.setAttribute('aria-expanded', String(expanded));
    menuButton.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
  }
  menuButton.setAttribute('aria-controls', menu.id);
  menuButton.addEventListener('click', syncMenu);
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', syncMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.classList.contains('hidden')) {
      menu.classList.add('hidden'); syncMenu(); menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
      menu.classList.add('hidden'); syncMenu();
    }
  });
  syncMenu();

  document.querySelectorAll('#faq button').forEach((button, index) => {
    const answer = button.nextElementSibling;
    if (!answer?.classList.contains('faq-answer')) return;
    answer.id = `faq-answer-${index + 1}`;
    button.setAttribute('aria-controls', answer.id);
    const sync = () => {
      const expanded = button.parentElement.classList.contains('faq-open');
      button.setAttribute('aria-expanded', String(expanded));
      answer.setAttribute('aria-hidden', String(!expanded));
      answer.inert = !expanded;
    };
    button.addEventListener('click', sync);
    sync();
  });
  const storiesButton = document.querySelector('button[onclick="toggleMoreStories()"]');
  if (storiesButton) {
    const stories = document.getElementById('more-user-stories');
    const sync = () => {
      const expanded = !stories.classList.contains('hidden');
      storiesButton.setAttribute('aria-expanded', String(expanded));
    };
    storiesButton.setAttribute('aria-controls', 'more-user-stories');
    storiesButton.addEventListener('click', sync);
    sync();
  }
  window.addEventListener('pageshow', restoreBackground);
})();
