"use client";

// The task under the pointer while it's carried to another block: solid and lifted.

export function TaskDragCard({ task }) {
  return (
    <div className="rounded-xl bg-card px-3 py-3 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.22)] ring-1 ring-foreground/10">
      <span className="line-clamp-2 break-words">{task.name}</span>
    </div>
  );
}
