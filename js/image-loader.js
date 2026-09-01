export async function loadImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('画像ファイルではありません');
  }

  const bitmap = await createImageBitmap(file, {
    imageOrientation: 'from-image',
  });

  return bitmap;
}

export function bitmapToPreviewImage(bitmap) {
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 400 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/jpeg', 0.8);
  return img;
}

export function aspectRatiosMatch(a, b, tolerance = 0.01) {
  const ratioA = a.width / a.height;
  const ratioB = b.width / b.height;
  return Math.abs(ratioA - ratioB) / ratioA < tolerance;
}