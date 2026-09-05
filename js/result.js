import { state } from './state.js';
import { encodeVideo } from './encoder.js';

const statusEl = document.getElementById('encodeStatus');
const barEl = document.getElementById('progressBar');
const logEl = document.getElementById('encodeLog');
const areaEl = document.getElementById('resultArea');

const PHASE_LABEL = {
  load: 'ffmpeg を読み込んでいます',
  frames: 'フレームを描画しています',
  audio: 'BGM を読み込んでいます',
  encode: 'エンコードしています',
  finish: '仕上げています',
};

let running = false;

function setProgress(phase, ratio, detail) {
  if (phase === 'log') {
    logEl.textContent = detail;
    return;
  }

  statusEl.classList.remove('ok', 'ng');
  statusEl.textContent = detail
    ? `${PHASE_LABEL[phase]}（${detail}）`
    : PHASE_LABEL[phase];

  if (ratio >= 0) {
    barEl.style.width = `${Math.round(ratio * 100)}%`;
  }
}

export async function initResult() {
  if (running) return;
  if (!state.riddleImage || !state.answerImage || !state.cropRect) {
    statusEl.textContent = '画像が選ばれていません';
    statusEl.className = 'message ng';
    return;
  }

  running = true;
  areaEl.innerHTML = '';
  barEl.style.width = '0%';
  logEl.textContent = '';

  const started = performance.now();

  try {
    const blob = await encodeVideo(
      {
        riddleImage: state.riddleImage,
        answerImage: state.answerImage,
        cropRect: state.cropRect,
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
  }
}