"use client";

// Said once: how many notes went, and the way to bring them back before they are gone for real.

import { Undo2 } from "lucide-react";
import MiloFace from "@/components/MiloFace";

export function DeletedToast({ count, onUndo }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl bg-chrome p-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip">
        <MiloFace
          mood="content"
          instant
          gaze={false}
          blink={false}
          reactToScroll={false}
          className="size-10"
        />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-chrome-ink">
          {count} {count === 1 ? "note" : "notes"} deleted
        </span>
        <span className="truncate text-xs text-chrome-ink/45">
          {count === 1 ? "You can still bring it back." : "You can still bring them back."}
        </span>
      </div>

      <button
        type="button"
        onClick={onUndo}
        className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl bg-chip px-3.5 text-sm text-chip-ink transition-colors hover:bg-chip/85"
      >
        <Undo2 className="size-4" />
        Undo
      </button>
    </div>
  );
}
