"use client";

// No notes here yet. Not a failing — most days won't have one.

import { Plus } from "lucide-react";

export function Empty({
  onAdd,
  text = "Anything you think of today. Every note is kept on your Notes page.",
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
      <img src="/taking-note.svg" alt="" className="dark:rounded-2xl dark:bg-chip dark:p-1 size-44" />

      <p className="max-w-xs text-sm text-foreground/45">{text}</p>

      <button
        type="button"
        onClick={onAdd}
        style={{ "--lift": "var(--chrome-lift)" }}
        className="milo-lift flex cursor-pointer items-center gap-2 rounded-xl bg-chrome px-5 py-2.5 text-sm font-medium text-chrome-ink"
      >
        <Plus className="size-4" />
        New note
      </button>
    </div>
  );
}
