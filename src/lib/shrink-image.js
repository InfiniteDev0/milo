// Photos are shrunk before they go into a note: at most 1600px on the long side, saved as WebP.
// The note is saved whole on every edit, so a full-size photo would ride along with each keystroke.

const MAX_SIDE = 1600;
const QUALITY = 0.82;

// null when the file is better left as it is
export async function shrinkImage(file) {
  // an animated GIF would lose its motion, and an SVG is already small
  if (file.type === "image/gif" || file.type === "image/svg+xml") return null;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const webp = canvas.toDataURL("image/webp", QUALITY);
  // a browser without WebP hands back a PNG, which is larger; JPEG then
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", QUALITY);
}
