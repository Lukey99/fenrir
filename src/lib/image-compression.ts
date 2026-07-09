/**
 * Resizes an image file to a square (cover-cropped) JPEG data URI, stepping the
 * JPEG quality down until the result fits under `targetBytes`. Used to keep
 * uploaded profile photos small enough to store as base64 directly in Postgres.
 */
export async function compressImageToDataUrl(
  file: File,
  { maxDim = 256, targetBytes = 150_000 }: { maxDim?: number; targetBytes?: number } = {}
): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.max(maxDim / bitmap.width, maxDim / bitmap.height);
  const sourceWidth = maxDim / scale;
  const sourceHeight = maxDim / scale;
  const sourceX = (bitmap.width - sourceWidth) / 2;
  const sourceY = (bitmap.height - sourceHeight) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = maxDim;
  canvas.height = maxDim;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Le navigateur ne supporte pas le recadrage d'image.");
  ctx.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, maxDim, maxDim);

  const qualities = [0.8, 0.6, 0.4];
  let lastDataUrl = canvas.toDataURL("image/jpeg", qualities[0]);

  for (const quality of qualities) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    lastDataUrl = dataUrl;
    if (dataUrl.length <= targetBytes) break;
  }

  return lastDataUrl;
}
