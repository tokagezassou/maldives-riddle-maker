import { state } from './state.js';
import { loadImage, bitmapToPreviewImage, aspectRatiosMatch } from './image_loader.js';

const statusEl = document.getElementById('uploadStatus');
const nextBtn = document.getElementById('toCropBtn');

function setupSlot(inputId, previewId, stateKey) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;

    preview.innerHTML = '<span class="info">読み込み中…</span>';

    try {
      const bitmap = await loadImage(file);
      state[stateKey] = bitmap;

      preview.innerHTML = '';
      preview.appendChild(bitmapToPreviewImage(bitmap));

      console.log(`${stateKey}: ${bitmap.width}×${bitmap.height}`);
    } catch (err) {
      console.error(err);
      state[stateKey] = null;
      preview.innerHTML = '<span class="info">読み込めませんでした</span>';
    }

    updateStatus();
  });
}

function updateStatus() {
  const a = state.riddleImage;
  const b = state.answerImage;

  statusEl.classList.remove('ok', 'ng');

  if (!a || !b) {
    statusEl.textContent = '2枚とも選んでください';
    nextBtn.disabled = true;
    return;
  }

  if (aspectRatiosMatch(a, b)) {
    statusEl.textContent = '準備できました';
    statusEl.classList.add('ok');
  } else {
    statusEl.textContent =
      '2枚の縦横比が違います。動画の上下または左右に黒帯が入ります。';
    statusEl.classList.add('ng');
  }

  nextBtn.disabled = false;
}

export function setupUpload() {
  setupSlot('riddleInput', 'riddlePreview', 'riddleImage');
  setupSlot('answerInput', 'answerPreview', 'answerImage');
}

export function initUpload() {
  const slots = [
    ['riddleInput', 'riddlePreview', 'riddleImage'],
    ['answerInput', 'answerPreview', 'answerImage'],
  ];

  for (const [inputId, previewId, stateKey] of slots) {
    document.getElementById(inputId).value = '';
    document.getElementById(previewId).innerHTML = '';

    if (state[stateKey]) state[stateKey].close();
    state[stateKey] = null;
  }

  state.cropRect = null;
  state.midProgress = 0.5;
  state.aspectRatio = null;
  state.outputSize = null;
  state.videoBlob = null;

  if (state.videoUrl) {
    URL.revokeObjectURL(state.videoUrl);
    state.videoUrl = null;
  }
  state.videoBlob = null;

  updateStatus();
}