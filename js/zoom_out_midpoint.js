import { state } from './state.js';
import { clamp, containFit } from './geometry.js';
import { interpRect } from './zoom_out_timeline.js';

const canvas = document.getElementById('midCanvas');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('midSlider');
const label = document.getElementById('midLabel');

const FRAME_W = 480;

let img = null;
let fullRect = null;

function currentRect() {
  return interpRect(state.cropRect, fullRect, state.midProgress);
}

function render() {
  if (!img) return;

  const cw = canvas.width;
  const ch = canvas.height;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cw, ch);

  const src = currentRect();
  const dst = containFit(src.width, src.height, cw, ch);

  ctx.drawImage(
    img,
    src.x, src.y, src.width, src.height,
    dst.x, dst.y, dst.width, dst.height
  );
}

function setProgress(p) {
  state.midProgress = clamp(p, 0, 1);
  slider.value = state.midProgress;

  const r = currentRect();
  const zoom = fullRect.width / r.width;

  render();
}

slider.addEventListener('input', () => {
  setProgress(Number(slider.value));
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const step = e.deltaY > 0 ? 0.02 : -0.02;
  setProgress(state.midProgress + step);
}, { passive: false });

export function initMidpoint() {
  img = state.riddleImage;
  if (!img || !state.cropRect) return;

  fullRect = containFit(state.aspectRatio, 1, img.width, img.height);

  const fw = state.aspectRatio >= 1 ? FRAME_W : FRAME_W * state.aspectRatio;
  canvas.width = Math.round(fw);
  canvas.height = Math.round(fw / state.aspectRatio);

  setProgress(state.midProgress);
}