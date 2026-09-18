// Images in notes. There is no file store yet, so an image rides inside the note's own HTML as a data URI,
// shrunk first so the note stays light. When Supabase Storage is set up, this one function is the swap.

import { shrinkImage } from "./shrink-image";

// the file you pick; what's stored is usually far smaller once shrunk
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// the file as it is, for anything that can't or shouldn't be shrunk
function readAsDataUrl(file, onProgress, abortSignal) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // real progress, not a timer pretending to be one
    reader.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.({ progress: Math.round((e.loaded / e.total) * 100) });
    };
    reader.onload = () => {
      if (abortSignal?.aborted) return reject(new Error("Upload cancelled"));
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("Couldn't read that file"));
    abortSignal?.addEventListener("abort", () => {
      reader.abort();
      reject(new Error("Upload cancelled"));
    });

    reader.readAsDataURL(file);
  });
}

export async function uploadNoteImage(file, onProgress, abortSignal) {
  if (!file) throw new Error("No file provided");
  if (!file.type.startsWith("image/")) throw new Error("That isn't an image");
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Images need to be under ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  onProgress?.({ progress: 10 });

  let shrunk = null;
  try {
    shrunk = await shrinkImage(file);
  } catch (err) {
    // a format the browser can't draw is still kept, just unshrunk
    console.warn("[milo] could not shrink that image, keeping it as it is", err);
  }
  if (abortSignal?.aborted) throw new Error("Upload cancelled");

  // a data URI is about 4/3 of the file; keep whichever is smaller
  if (shrunk && shrunk.length < (file.size * 4) / 3) {
    onProgress?.({ progress: 100 });
    return shrunk;
  }

  const original = await readAsDataUrl(file, onProgress, abortSignal);
  onProgress?.({ progress: 100 });
  return original;
}
