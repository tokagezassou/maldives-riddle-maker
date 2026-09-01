export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function containFit(srcW, srcH, dstW, dstH) {
  const scale = Math.min(dstW / srcW, dstH / srcH);
  const w = srcW * scale;
  const h = srcH * scale;
  return { x: (dstW - w) / 2, y: (dstH - h) / 2, width: w, height: h };
}

export function deriveOutputSize(ratio, budget = 1280 * 720) {
  let w = Math.sqrt(budget * ratio);
  let h = w / ratio;

  const longSide = Math.max(w, h);
  if (longSide > 1920) {
    const k = 1920 / longSide;
    w *= k;
    h *= k;
  }

  w = Math.max(2, Math.round(w / 2) * 2);
  h = Math.max(2, Math.round(h / 2) * 2);

  return { width: w, height: h };
}