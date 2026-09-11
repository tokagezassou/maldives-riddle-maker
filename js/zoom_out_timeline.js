import { CONFIG } from './config.js';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function warpTime(t, r0, r1) {
  const w0 = r0.width;
  const w1 = r1.width;
  if (w0 >= w1) return t;

  // 指数的に変化する幅を求め、それが線形補間上のどこに当たるか逆算
  const w = w0 * Math.pow(w1 / w0, t);
  return (w - w0) / (w1 - w0);
}

export function interpRect(r0, r1, t) {
  const u = warpTime(t, r0, r1);
  return {
    x: lerp(r0.x, r1.x, u),
    y: lerp(r0.y, r1.y, u),
    width: lerp(r0.width, r1.width, u),
    height: lerp(r0.height, r1.height, u),
  };
}

export function riddleRectAt(t, cropRect, fullRect, midProgress) {
  const { slowZoomDuration, fastZoomDuration } = CONFIG;

  if (t <= 0) return cropRect;

  if (t < slowZoomDuration) {
    const p = (t / slowZoomDuration) * midProgress;
    return interpRect(cropRect, fullRect, p);
  }

  const t2 = (t - slowZoomDuration) / fastZoomDuration;
  if (t2 < 1) {
    const p = midProgress + t2 * (1 - midProgress);
    return interpRect(cropRect, fullRect, p);
  }

  return fullRect;
}

export function answerOpacity(t) {
  const { answerStartTime, answerFadeDuration } = CONFIG;
  if (t <= answerStartTime) return 0;
  if (t >= answerStartTime + answerFadeDuration) return 1;
  return (t - answerStartTime) / answerFadeDuration;
}