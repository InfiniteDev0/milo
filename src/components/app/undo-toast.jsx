"use client";

// Said once when something goes: what it was, and a few seconds to bring it back before it is gone for real.

import { Undo2 } from "lucide-react";
import { toast } from "sonner";
import MiloFace from "@/components/MiloFace";

// how long Undo stays on screen before a delete is real
export const UNDO_MS = 6000;

function UndoToast({ title, hint, onUndo }) {
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
        <span className="truncate text-sm text-chrome-ink">{title}</span>
        {hint && <span className="truncate text-xs text-chrome-ink/45">{hint}</span>}
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

// onCommit runs once, when the toast closes by itself or is swiped away; pressing Undo first runs onUndo instead
export function showUndoToast({ title, hint, onUndo, onCommit, duration = UNDO_MS }) {
  const id = crypto.randomUUID();
  let settled = false;

  // sonner can report both a dismiss and an auto-close, so each side runs at most once
  const commit = () => {
    if (settled) return;
    settled = true;
    onCommit();
  };
  const undo = () => {
    if (settled) return;
    settled = true;
    toast.dismiss(id);
    onUndo();
  };

  toast.custom(() => <UndoToast title={title} hint={hint} onUndo={undo} />, {
    unstyled: true,
    id,
    duration,
    onAutoClose: commit,
    onDismiss: commit,
  });
}
