import { CONFIG } from './config.js';
import { containFit } from './geometry.js';
import { riddleRectAt, answerOpacity } from './zoom_out_timeline.js';

export function fullRectOf(img, aspectRatio) {
  return containFit(aspectRatio, 1, img.width, img.height);
}

export function drawFrame(ctx, t, opts) {
  const { riddleImage, answerImage, cropRect, midProgress, aspectRatio } = opts;
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;

  ctx.globalAlpha = 1;
  ctx.fillStyle = CONFIG.backgroundColor;
  ctx.fillRect(0, 0, cw, ch);

  const full = fullRectOf(riddleImage, aspectRatio);
  const src = riddleRectAt(t, cropRect, full, midProgress);
  const dst = containFit(src.width, src.height, cw, ch);

  ctx.drawImage(
    riddleImage,
    src.x, src.y, src.width, src.height,
    dst.x, dst.y, dst.width, dst.height
  );

  const alpha = answerOpacity(t);
  if (alpha > 0) {
    const aSrc = fullRectOf(answerImage, aspectRatio);
    const aDst = containFit(aSrc.width, aSrc.height, cw, ch);

    ctx.globalAlpha = alpha;
    ctx.drawImage(
      answerImage,
      aSrc.x, aSrc.y, aSrc.width, aSrc.height,
      aDst.x, aDst.y, aDst.width, aDst.height
    );
    ctx.globalAlpha = 1;
  }
}

export function totalFrames() {
  return Math.round(CONFIG.duration * CONFIG.fps);
}