"use client";

// A quiet bin on a task. It never opens the task or starts a drag, and deleting always offers Undo.

import { Trash2 } from "lucide-react";
import { useBlocks } from "./blocks-provider";

// the card around it listens for these to open or drag; the bin keeps them to itself
const keep = (e) => e.stopPropagation();

export function DeleteTaskButton({ task, className = "" }) {
  const { removeTask } = useBlocks();

  return (
    <button
      type="button"
      onPointerDown={keep}
      onMouseDown={keep}
      onTouchStart={keep}
      onKeyDown={keep}
      onClick={(e) => {
        e.stopPropagation();
        removeTask(task.id);
      }}
      aria-label={`Delete ${task.name}`}
      title="Delete"
      // shown on hover, always shown where there is no hover
      className={`flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-foreground/35 opacity-0 transition hover:bg-foreground/5 hover:text-[#dc2626] focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${className}`}
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}
