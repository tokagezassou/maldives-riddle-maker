import { state } from './state.js';
import { clamp, containFit, deriveOutputSize } from './geometry.js';

const MIN_RATIO = 0.01;
const MAX_RATIO = 1.0;
const LOG_RANGE = Math.log(MAX_RATIO / MIN_RATIO);

const FRAME_W = 480;      // 枠の表示サイズ（長辺）
const MARGIN = 60;        // 枠の外側のグレー領域

const canvas = document.getElementById('cropCanvas');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('zoomSlider');
const zoomLabel = document.getElementById('zoomLabel');

let img = null;
let ratio = 1;            // 枠が捉える範囲（画像に対する割合）
let centerX = 0;          // 枠の中心（画像ピクセル座標）
let centerY = 0;

let frame = null;         // 枠の画面上の位置 { x, y, width, height }

function sliderToRatio(v) {
  return MIN_RATIO * Math.exp(LOG_RANGE * (1 - v));
}

function ratioToSlider(r) {
  return 1 - Math.log(r / MIN_RATIO) / LOG_RANGE;
}

/**
 * 枠が捉える画像上の矩形（画像ピクセル座標）
 */
function computeCropRect() {
  const base = containFit(state.aspectRatio, 1, img.width, img.height);
  const w = base.width * ratio;
  const h = base.height * ratio;

  return {
    x: centerX - w / 2,
    y: centerY - h / 2,
    width: w,
    height: h,
  };
}

/**
 * 画像座標 → 画面座標 の倍率。
 * 枠内に cropRect がちょうど収まるように決まる。
 */
function currentScale() {
  return frame.width / computeCropRect().width;
}

function clampCenter() {
  const r = computeCropRect();
  centerX = clamp(centerX, r.width / 2, img.width - r.width / 2);
  centerY = clamp(centerY, r.height / 2, img.height - r.height / 2);
}

function setRatio(newRatio) {
  ratio = clamp(newRatio, MIN_RATIO, MAX_RATIO);
  clampCenter();
  commit();
  render();

  slider.value = ratioToSlider(ratio);
}

function setCenter(x, y) {
  centerX = x;
  centerY = y;
  clampCenter();
  commit();
  render();
}

function commit() {
  state.cropRect = computeCropRect();
}

// --- 描画 ---
function render() {
  if (!img) return;

  const cw = canvas.width;
  const ch = canvas.height;

  // 背景（マージン部分の地色）
  ctx.fillStyle = '#666';
  ctx.fillRect(0, 0, cw, ch);

  const scale = currentScale();
  const r = computeCropRect();

  // 画像全体を、枠内に cropRect が来るように配置して描く
  const drawX = frame.x - r.x * scale;
  const drawY = frame.y - r.y * scale;
  const drawW = img.width * scale;
  const drawH = img.height * scale;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  // 枠の外側を暗くする
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.rect(0, 0, cw, ch);
  ctx.rect(frame.x, frame.y, frame.width, frame.height);
  ctx.fill('evenodd');

  // 枠線
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(frame.x, frame.y, frame.width, frame.height);
}

// --- ドラッグ ---
let dragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('pointerdown', (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  canvas.classList.add('dragging');
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;

  const scale = currentScale();
  const dx = (e.clientX - lastX) / scale;
  const dy = (e.clientY - lastY) / scale;
  lastX = e.clientX;
  lastY = e.clientY;

  setCenter(centerX - dx, centerY - dy);
});

canvas.addEventListener('pointerup', (e) => {
  dragging = false;
  canvas.classList.remove('dragging');
  canvas.releasePointerCapture(e.pointerId);
});

canvas.addEventListener('pointercancel', () => {
  dragging = false;
  canvas.classList.remove('dragging');
});

// --- ホイール ---
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const k = e.deltaY > 0 ? 1.08 : 1 / 1.08;
  setRatio(ratio * k);
}, { passive: false });

// --- スライダー ---
slider.addEventListener('input', () => {
  setRatio(sliderToRatio(Number(slider.value)));
});

export function initCropper() {
  img = state.riddleImage;
  if (!img) return;

  state.aspectRatio = img.width / img.height;
  state.outputSize = deriveOutputSize(state.aspectRatio);

  // 枠のサイズを出力比から決める
  const fw = state.aspectRatio >= 1 ? FRAME_W : FRAME_W * state.aspectRatio;
  const fh = fw / state.aspectRatio;

  frame = {
    x: MARGIN,
    y: MARGIN,
    width: Math.round(fw),
    height: Math.round(fh),
  };

  canvas.width = frame.width + MARGIN * 2;
  canvas.height = frame.height + MARGIN * 2;

  ratio = 1;
  centerX = img.width / 2;
  centerY = img.height / 2;

  setRatio(1);
}