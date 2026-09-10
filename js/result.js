import { state } from './state.js';
import { encodeVideo } from './encoder.js';
import { lockNavigation, unlockNavigation } from './screens.js';

const statusEl = document.getElementById('encodeStatus');
const barEl = document.getElementById('progressBar');
const logEl = document.getElementById('encodeLog');
const areaEl = document.getElementById('resultArea');


const PHASE_ORDER = ['load', 'frames', 'audio', 'encode', 'finish'];

let running = false;

const PHASE_WEIGHT = {
  load: 0.05,
  frames: 0.45,
  audio: 0.02,
  encode: 0.45,
  finish: 0.03,
};

function phaseOffset(phase) {
  let sum = 0;
  for (const p of PHASE_ORDER) {
    if (p === phase) break;
    sum += PHASE_WEIGHT[p];
  }
  return sum;
}

function setProgress(phase, ratio, detail) {
  if (phase === 'log') {
    logEl.textContent = detail;
    return;
  }

  statusEl.classList.remove('ok', 'ng');
  statusEl.textContent = '動画を作っています…（画面を閉じないでください）';

  const r = ratio < 0 ? 0 : ratio;
  const overall = phaseOffset(phase) + PHASE_WEIGHT[phase] * r;

  barEl.style.width = `${Math.round(overall * 100)}%`;
}

export async function initResult() {
  console.log('[A] initResult 開始', running);
  if (running) return;

  console.log('[B] state', !!state.riddleImage, !!state.answerImage, !!state.cropRect);
  if (!state.riddleImage || !state.answerImage || !state.cropRect) {
    statusEl.textContent = '画像が選ばれていません';
    statusEl.className = 'message ng';
    return;
  }

  console.log('[C] DOM', !!statusEl, !!barEl, !!logEl, !!areaEl);

  running = true;
  lockNavigation();
  areaEl.innerHTML = '';
  barEl.style.width = '0%';
  logEl.textContent = '';

  console.log('[D] 初期化完了');

  const started = performance.now();

  try {
    console.log('[E] encodeVideo 呼び出し', state.outputSize);
    const blob = await encodeVideo(
      {
        riddleImage: state.riddleImage,
        answerImage: state.answerImage,
        cropRect: state.cropRect,
        midProgress: state.midProgress,
        aspectRatio: state.aspectRatio,
      },
      state.outputSize,
      setProgress
    );

    state.videoBlob = blob;

    const seconds = ((performance.now() - started) / 1000).toFixed(1);
    const mb = (blob.size / 1024 / 1024).toFixed(2);

    statusEl.textContent = `完成しました（${seconds}秒 / ${mb}MB）`;
    statusEl.className = 'message ok';
    barEl.style.width = '100%';
    logEl.textContent = '';

    console.log(`エンコード所要時間: ${seconds}秒`);

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'riddle.mp4';
    link.textContent = 'ダウンロード';
    link.className = 'download-link';
    areaEl.appendChild(link);

    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.playsInline = true;
    areaEl.appendChild(video);
  } catch (err) {
    console.error(err);
    statusEl.textContent = `失敗しました: ${err.message}`;
    statusEl.className = 'message ng';
  } finally {
    running = false;
    unlockNavigation();
  }
}