import { CONFIG } from './config.js';

export function zoomProgress(t) {
  const { slowZoomDuration, slowZoomProgress, fastZoomDuration } = CONFIG;
  const midpoint = slowZoomProgress / 100;

  if (t <= 0) return 0;

  if (t < slowZoomDuration) {
    return (t / slowZoomDuration) * midpoint;
  }

  if (t < slowZoomDuration + fastZoomDuration) {
    const p = (t - slowZoomDuration) / fastZoomDuration;
    return midpoint + p * (1 - midpoint);
  }

  return 1;
}

export function answerOpacity(t) {
  const { answerStartTime, answerFadeDuration } = CONFIG;
  if (t <= answerStartTime) return 0;
  if (t >= answerStartTime + answerFadeDuration) return 1;
  return (t - answerStartTime) / answerFadeDuration;
}


/**
 * 進捗 p における謎画像の表示範囲（画像ピクセル座標）
 * 面積比を指数的に補間する
 */
export function riddleRect(cropRect, fullRect, p) {
  const k = Math.pow(fullRect.width / cropRect.width, p);

  const w = cropRect.width * k;
  const h = cropRect.height * k;

  // 中心は線形補間
  const cx0 = cropRect.x + cropRect.width / 2;
  const cy0 = cropRect.y + cropRect.height / 2;
  const cx1 = fullRect.x + fullRect.width / 2;
  const cy1 = fullRect.y + fullRect.height / 2;

  const cx = cx0 + (cx1 - cx0) * p;
  const cy = cy0 + (cy1 - cy0) * p;

  return { x: cx - w / 2, y: cy - h / 2, width: w, height: h };
}
