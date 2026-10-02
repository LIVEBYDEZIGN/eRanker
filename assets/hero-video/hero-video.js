(() => {
  'use strict';
  const card = document.getElementById('hero-video-card');
  if (!card) return;
  const video = document.getElementById('hero-video-player');
  const playback = document.getElementById('hero-video-playback');
  const playBadge = document.getElementById('hero-video-play-badge');
  const sound = document.getElementById('hero-video-sound');
  const status = document.getElementById('hero-video-status');
  const soundLabel = document.getElementById('hero-video-sound-label');
  const soundWaves = document.getElementById('hero-video-sound-waves');
  const soundCross = document.getElementById('hero-video-sound-cross');
  const external = document.getElementById('hero-video-external');
  video.controls = false;

  function sync() {
    card.dataset.playback = video.error ? 'unavailable' : video.ended ? 'ended' :
      video.paused ? 'paused' : video.readyState < 3 ? 'buffering' : 'playing';
    card.dataset.muted = String(video.muted);
    card.dataset.currentTime = video.currentTime.toFixed(2);
    playback.setAttribute('aria-label', video.ended ? 'Replay video' : video.paused ? 'Play video' : 'Pause video');
    playBadge.classList.toggle('hidden', !video.paused || video.readyState < 2);
    soundLabel.textContent = video.muted ? 'Sound on' : 'Sound off';
    sound.setAttribute('aria-label', video.muted ? 'Turn video sound on' : 'Turn video sound off');
    soundWaves.classList.toggle('hidden', !video.muted);
    soundCross.classList.toggle('hidden', video.muted);
  }

  function requestPlay() {
    video.play().catch(() => {
      // A browser may require a gesture. Leave the central play button ready.
      sync();
      if (!video.error) playBadge.classList.remove('hidden');
    });
  }

  playback.addEventListener('click', () => {
    if (video.paused) requestPlay();
    else video.pause();
  });
  sound.addEventListener('click', () => {
    video.muted = !video.muted;
    sync();
  });

  video.addEventListener('loadeddata', () => {
    sound.disabled = false;
    status.textContent = '2:11';
    sync();
  });
  video.addEventListener('playing', () => {
    if (!card.dataset.startedMs) card.dataset.startedMs = performance.now().toFixed(0);
  });
  video.addEventListener('waiting', () => {
    if (card.dataset.startedMs) card.dataset.rebuffers = String(Number(card.dataset.rebuffers || 0) + 1);
  });
  ['playing', 'pause', 'ended', 'volumechange', 'timeupdate', 'waiting'].forEach(event => {
    video.addEventListener(event, sync);
  });
  video.addEventListener('error', () => {
    playback.classList.add('hidden');
    sound.classList.add('hidden');
    external.classList.remove('hidden');
    status.textContent = '2:11';
    sync();
  });

  // Muting before play also covers browsers that restore a previous volume.
  video.muted = true;
  if (video.readyState >= 2) {
    sound.disabled = false;
    status.textContent = '2:11';
  }
  requestPlay();
})();
