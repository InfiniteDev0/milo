"use client";

/* The banner across the top of a category's page. None yet: a soft band that
   says Add cover. A picture: it fills the band, and on hover one bar at its top
   right: Change, Reposition, and × to take it away. Reposition: drag
   the picture up or down, then Save position (or Cancel). Pictures are shrunk to
   1600px WebP first; before migration 0021 Add cover says it isn't on yet. */

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { checkCovers } from "@/lib/db/categories";
import { shrinkImage } from "@/lib/shrink-image";
import { cn } from "@/lib/utils";

// the most a cover may weigh once shrunk (the database allows 1.5MB)
const MAX = 1_500_000;
const BAR = "flex items-center divide-x divide-white/15 overflow-hidden rounded-md bg-black/60 text-xs font-medium text-white backdrop-blur-sm";
const PART = "flex h-8 cursor-pointer items-center gap-1.5 px-3 transition-colors hover:bg-white/10";
const clamp = (n) => Math.min(100, Math.max(0, n));

// pick(): opens the file picker; input: the hidden file box, placed once on the page
export function useCoverPicker(onCover) {
  const box = useRef(null);
  const take = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    try {
      const src = await shrinkImage(file, 1600);
      if (!src) toast("That picture can’t be a cover. Try a JPG, PNG or WebP.");
      else if (src.length > MAX) toast("That picture is too big for a cover.");
      else onCover(src);
    } catch {
      toast("Couldn’t read that picture.");
    }
  };
  const pick = async () => {
    if (await checkCovers()) box.current?.click();
    else toast("Covers switch on once migration 0021 is run in Supabase.");
  };
  const input = (
    <input
      ref={box}
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => {
        take(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );
  return { pick, input };
}

// y: where the picture sits (0 top, 100 bottom). onPick / onRemove / onMove: left out when you can't change it
export function CategoryCover({ cover, y = 50, onPick, onRemove, onMove }) {
  // while repositioning: where it sits now, and where the drag began
  const [moving, setMoving] = useState(null);
  const drag = useRef(null);
  const img = useRef(null);

  if (!cover) {
    return (
      <div className="flex h-36 shrink-0 items-center justify-center bg-foreground/4">
        {onPick && (
          <button
            type="button"
            onClick={onPick}
            data-tour="category-cover"
            className="flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
          >
            <ImagePlus className="size-4" />
            Add cover
          </button>
        )}
      </div>
    );
  }

  const shown = moving ?? y;
  // how far the picture overhangs the band, in px: a drag that far moves it end to end
  const overhang = () => {
    const el = img.current;
    if (!el?.naturalWidth) return 0;
    return (el.naturalHeight / el.naturalWidth) * el.clientWidth - el.clientHeight;
  };

  return (
    <div className="group/cover relative h-52 shrink-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={img}
        src={cover}
        alt=""
        draggable={false}
        style={{ objectPosition: `50% ${shown}%` }}
        className={cn("size-full touch-none object-cover select-none", moving != null && "cursor-move")}
        onPointerDown={(e) => {
          if (moving == null) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { from: e.clientY, start: moving, room: overhang() };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.room <= 0) return;
          // down shows more of the top
          setMoving(clamp(d.start - ((e.clientY - d.from) / d.room) * 100));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      />

      {moving != null && (
        <span className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 rounded-md bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
          Drag the picture to reposition
        </span>
      )}

      {onPick && (
        <div
          className={cn(
            "absolute top-3 right-4 transition-opacity focus-within:opacity-100",
            moving != null ? "opacity-100" : "opacity-0 group-hover/cover:opacity-100",
          )}
        >
          {moving != null ? (
            <div className={BAR}>
              <button
                type="button"
                onClick={() => {
                  onMove(Math.round(moving));
                  setMoving(null);
                }}
                className={PART}
              >
                Save position
              </button>
              <button type="button" onClick={() => setMoving(null)} className={PART}>
                Cancel
              </button>
            </div>
          ) : (
            <div className={BAR}>
              <button type="button" onClick={onPick} className={PART}>
                Change
              </button>
              <button type="button" onClick={() => setMoving(y)} className={PART}>
                Reposition
              </button>
              <button type="button" onClick={onRemove} aria-label="Remove cover" title="Remove" className={PART}>
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
