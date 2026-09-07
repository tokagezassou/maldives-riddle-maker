import { CONFIG } from './config.js';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function interpRect(r0, r1, t) {
  const k = Math.pow(r1.width / r0.width, t);
  const w = r0.width * k;
  const h = r0.height * k;

  const cx = lerp(r0.x + r0.width / 2, r1.x + r1.width / 2, t);
  const cy = lerp(r0.y + r0.height / 2, r1.y + r1.height / 2, t);

  return { x: cx - w / 2, y: cy - h / 2, width: w, height: h };
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