import { CONFIG } from './config.js';
import { drawFrame, totalFrames } from './renderer.js';

const FFMPEG_VERSION = '0.12.15';
const CORE_VERSION = '0.12.10';

let ffmpeg = null;

/**
 * ffmpeg.wasm を読み込む（初回のみ）
 */
async function loadFFmpeg(onLog) {
  if (ffmpeg) return ffmpeg;

  console.log('[1] import 開始');
  const { FFmpeg } = await import(
    `https://unpkg.com/@ffmpeg/ffmpeg@${FFMPEG_VERSION}/dist/esm/index.js`
  );
  const { toBlobURL } = await import(
    `https://unpkg.com/@ffmpeg/util@0.12.2/dist/esm/index.js`
  );
  console.log('[2] import 完了');

  const coreURL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

  ffmpeg = new FFmpeg();
  ffmpeg.on('log', ({ message }) => {
    if (onLog) onLog(message);
  });

  console.log('[3] Blob 化開始');
  const core = await toBlobURL(`${coreURL}/ffmpeg-core.js`, 'text/javascript');
  const wasm = await toBlobURL(`${coreURL}/ffmpeg-core.wasm`, 'application/wasm');
  console.log('[4] Blob 化完了');

  console.log('[5] load 開始');
  await ffmpeg.load({
    coreURL: core,
    wasmURL: wasm,
    classWorkerURL: new URL('../vendor/ffmpeg-worker.js', import.meta.url).href,
  });
  console.log('[6] load 完了');

  return ffmpeg;
}
/**
 * Canvas を JPEG の Uint8Array にする
 */
function canvasToBytes(canvas, quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('toBlob に失敗しました'));
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * 動画を生成して Blob を返す
 * @param {object} opts - riddleImage, answerImage, cropRect, aspectRatio
 * @param {object} size - { width, height }
 * @param {function} onProgress - (phase, ratio, detail) => void
 */
export async function encodeVideo(opts, size, onProgress) {
  const report = onProgress || (() => {});
  let lastLog = '';

  report('load', 0, 'ffmpeg を読み込み中');
  const fm = await loadFFmpeg((msg) => {
    lastLog = msg;
    report('log', -1, msg);
  });

  // --- フレーム生成 ---
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');

  const frames = totalFrames();

  for (let i = 0; i < frames; i++) {
    if (i === 0) console.log('[7] フレーム生成開始', size);
    const t = i / CONFIG.fps;
    drawFrame(ctx, t, opts);

    const bytes = await canvasToBytes(canvas);
    const name = `frame_${String(i).padStart(4, '0')}.jpg`;
    await fm.writeFile(name, bytes);

    report('frames', (i + 1) / frames, `${i + 1} / ${frames} フレーム`);
  }

  // --- BGM ---
  report('audio', 0, 'BGM を読み込み中');
  let hasAudio = false;
  try {
    const res = await fetch(CONFIG.bgmFile, { cache: 'no-store' });
    console.log('[8] BGM fetch', res.status, res.ok);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      console.log('[9] BGM サイズ', buf.byteLength);
      await fm.writeFile('bgm.m4a', new Uint8Array(buf));
      console.log('[10] BGM writeFile 完了');
      hasAudio = true;
    }
  } catch (err) {
    console.warn('BGM を読み込めませんでした:', err);
  }

  // --- エンコード ---
  report('encode', 0, 'エンコード中');

  fm.on('progress', ({ progress }) => {
    report('encode', Math.min(1, Math.max(0, progress)), 'エンコード中');
  });

  const args = [
    '-framerate', String(CONFIG.fps),
    '-i', 'frame_%04d.jpg',
  ];

  if (hasAudio) {
    args.push('-i', 'bgm.m4a');
  }

  args.push(
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'veryfast',
    '-crf', '23',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,setsar=1',
  );

  if (hasAudio) {
    args.push('-c:a', 'copy', '-shortest');
  }

  args.push('-movflags', '+faststart', 'out.mp4');

  console.log('[11] exec 開始', args);
  await fm.exec(args);

  // --- 取り出し ---
  report('finish', 1, '仕上げ中');
  const data = await fm.readFile('out.mp4');
  const blob = new Blob([data.buffer], { type: 'video/mp4' });

  // --- 後片付け ---
  for (let i = 0; i < frames; i++) {
    const name = `frame_${String(i).padStart(4, '0')}.jpg`;
    try {
      await fm.deleteFile(name);
    } catch (e) { /* 無視 */ }
  }
  try {
    await fm.deleteFile('out.mp4');
  } catch (e) { /* 無視 */ }

  return blob;
}