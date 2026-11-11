"use client";

/* Your own picture as the icon: choose a file, or paste one (or a link to one)
   with Ctrl+V. It shows before Save; Cancel closes without changing anything.
   A file is shrunk to a 64px square first (cropped from the middle), so it's a
   few KB and can be kept with the category itself — no storage bucket. */

import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE = 64;

// the picture, cropped square from its middle and drawn at 64px, as a PNG data URL
async function shrink(file) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  canvas.getContext("2d").drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();
  return canvas.toDataURL("image/png");
}

export function UploadTab({ onPick, onCancel }) {
  const [src, setSrc] = useState(null);
  const input = useRef(null);

  const take = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    try {
      setSrc(await shrink(file));
    } catch {
      // a file the browser can't draw (a broken image) just isn't taken
    }
  };

  // Ctrl+V anywhere while this tab is open: an image, or a link to one
  useEffect(() => {
    const onPaste = (e) => {
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
      if (file) return void take(file);
      const text = e.clipboardData?.getData("text")?.trim();
      if (text && /^https?:\/\//.test(text)) setSrc(text);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  return (
    <div className="flex flex-col gap-3 p-3">
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => take(e.target.files?.[0])} />
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-foreground/[0.06] text-sm text-foreground/80 transition-colors hover:bg-foreground/10"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="size-8 rounded-sm object-cover" />
        ) : (
          <ImageIcon className="size-4" />
        )}
        {src ? "Choose another image" : "Upload an image"}
      </button>
      <p className="text-center text-xs text-muted-foreground">or Ctrl+V to paste an image or link</p>
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 cursor-pointer rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!src}
          onClick={() => onPick({ type: "image", src })}
          className={cn(
            "h-8 rounded-md px-3.5 text-sm font-medium text-white transition-colors",
            src ? "cursor-pointer bg-(--theme-accent) hover:bg-(--theme-accent)/90" : "bg-(--theme-accent)/40",
          )}
        >
          Save
        </button>
      </div>
    </div>
  );
}
