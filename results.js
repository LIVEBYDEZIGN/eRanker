'use strict';

// Load a YouTube player only when a visitor chooses to watch a proof video.
document.querySelectorAll('.video-facade').forEach(link => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = link.className;
  button.setAttribute('aria-label', link.getAttribute('aria-label'));
  button.append(...link.childNodes);
  const id = link.dataset.video;
  const title = link.dataset.title;
  link.replaceWith(button);

  button.addEventListener('click', () => {
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
    const player = document.createElement('iframe');
    player.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`;
    player.title = title;
    player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    button.replaceWith(player);
    player.focus();
  });
});
