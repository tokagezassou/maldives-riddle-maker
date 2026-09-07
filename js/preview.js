import { state } from './state.js';
import { CONFIG } from './config.js';
import { drawFrame } from './renderer.js';
import { containFit } from './geometry.js';

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const seekBar = document.getElementById('seekBar');
const timeLabel = document.getElementById('timeLabel');

let playing = false;
let startedAt = 0;      // 再生開始時の performance.now()
let currentTime = 0;    // 現在の再生位置（秒）
let rafId = null;

function opts() {
  return {
    riddleImage: state.riddleImage,
    answerImage: state.answerImage,
    cropRect: state.cropRect,
    midRect: state.midRect,
    aspectRatio: state.aspectRatio,
  };
}

function renderAt(t) {
  currentTime = t;
  drawFrame(ctx, t, opts());

  seekBar.value = t / CONFIG.duration;
  timeLabel.textContent = `${t.toFixed(1)} / ${CONFIG.duration.toFixed(1)}`;
}

function loop() {
  const elapsed = (performance.now() - startedAt) / 1000;

  if (elapsed >= CONFIG.duration) {
    renderAt(CONFIG.duration);
    stop();
    return;
  }

  renderAt(elapsed);
  rafId = requestAnimationFrame(loop);
}

function play() {
  if (playing) return;

  // 末尾まで再生済みなら頭から
  const from = currentTime >= CONFIG.duration - 0.01 ? 0 : currentTime;

  playing = true;
  playBtn.textContent = '停止';
  startedAt = performance.now() - from * 1000;
  rafId = requestAnimationFrame(loop);
}

function stop() {
  playing = false;
  playBtn.textContent = '再生';
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

playBtn.addEventListener('click', () => {
  playing ? stop() : play();
});

seekBar.addEventListener('input', () => {
  stop();
  renderAt(Number(seekBar.value) * CONFIG.duration);
});

export function initPreview() {
  if (!state.riddleImage || !state.cropRect) return;

  // canvas の表示サイズを出力比に合わせる
  const maxW = 560;
  const maxH = 420;
  const fit = containFit(state.aspectRatio, 1, maxW, maxH);
  canvas.width = Math.round(fit.width);
  canvas.height = Math.round(fit.height);

  stop();
  renderAt(0);
}