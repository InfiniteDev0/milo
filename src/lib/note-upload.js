/* Real image handling for notes.
 *
 * Tiptap's template ships `handleImageUpload` as a demo: it fakes five seconds
 * of progress and returns "/images/tiptap-ui-placeholder-image.jpg", a file
 * that doesn't exist in this project. Their own comment says to replace it.
 *
 * There is no file store yet, so the image is inlined as a data URI and rides
 * along inside the note's HTML. That is a real, working upload for a local
 * app and a bad one for a hosted app: localStorage caps out around 5MB, so
 * this holds a handful of small images, not a photo library.
 *
 * When Supabase Storage is live, this one function is the swap — everything
 * above it keeps working unchanged.
 */

export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export async function uploadNoteImage(file, onProgress, abortSignal) {
  if (!file) throw new Error("No file provided");

  if (!file.type.startsWith("image/")) {
    throw new Error("That isn't an image");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `Images need to be under ${MAX_FILE_SIZE / (1024 * 1024)}MB for now`,
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // real progress, not a timer pretending to be one
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.({ progress: Math.round((e.loaded / e.total) * 100) });
      }
    };

    reader.onload = () => {
      if (abortSignal?.aborted) return reject(new Error("Upload cancelled"));
      onProgress?.({ progress: 100 });
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
