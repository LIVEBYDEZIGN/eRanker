'use strict';

// Approved homepage interactions. The test form connects to HubSpot checkout.
const video = document.getElementById('overview');
const playButton = document.getElementById('play-overview');
const videoError = document.getElementById('video-error');
playButton.hidden = false;
video.controls = false;

playButton.addEventListener('click', async () => {
  videoError.hidden = true;
  video.controls = true;
  playButton.hidden = true;
  try {
    await video.play();
    video.focus();
  } catch {
    playButton.hidden = false;
    videoError.hidden = false;
  }
});
video.addEventListener('error', () => {
  playButton.hidden = false;
  videoError.hidden = false;
});
video.addEventListener('ended', () => {
  playButton.hidden = false;
  video.controls = false;
});

const themeButton = document.getElementById('theme-toggle');
const themeLabel = themeButton.querySelector('span');
const themeMeta = document.querySelector('meta[name="theme-color"]');
themeButton.hidden = false;
themeButton.addEventListener('click', () => {
  const light = document.documentElement.dataset.theme !== 'light';
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  themeLabel.textContent = light ? 'Dark mode' : 'Light mode';
  themeButton.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  themeMeta.content = light ? '#fffaf7' : '#020204';
});
