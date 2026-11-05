"use client";

// The row of block columns, and one big drop target under them: carry a block's
// box anywhere over it and let go, and that block goes first and starts. It
// brightens while a box is over it. Scrolls sideways only; each block scrolls
// its own tasks, under its pinned box and Add a task.

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

export function BoardArea({ rowRef, active, children }) {
  const { setNodeRef } = useDroppable({ id: "board" });

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        rowRef.current = el;
      }}
      className={cn(
        "scrollbar-none flex min-h-0 flex-1 gap-6 overflow-x-auto overflow-y-hidden px-4 pt-2 transition-colors duration-200",
        active ? "bg-foreground/[0.07]" : "bg-muted/30",
      )}
    >
      {children}
    </div>
  );
}
