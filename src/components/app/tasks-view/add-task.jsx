"use client";

// "Add a task" at the top of a day. Pressing it opens a new card under it to
// write in — the day column holds that card, this is only the button.

import { CirclePlus } from "lucide-react";

export function AddTask({ onStart }) {
  return (
    <button
      type="button"
      onClick={onStart}
      className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <CirclePlus className="size-3.5 shrink-0" />
      Add a task
    </button>
  );
}
