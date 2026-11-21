"use client";

// One task on the landing board's Task view, as the app's card: its tick, a time if it has one, its tools underneath.
// It drags as the app's does (dnd-kit), and fades where it was while it's carried.

import { useDraggable } from "@dnd-kit/core";
import { Check, NotebookPen, Play, Workflow } from "lucide-react";

export const BLUE = "#2f80ed";

export function DayTask({ id, day, title, time, done, lifted }) {
  const { setNodeRef, attributes, listeners } = useDraggable({ id, data: { from: day } });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-task-card
      className={`flex cursor-pointer flex-col gap-2 rounded-md border border-(--b-fill2) bg-(--b-card) px-3 py-2.5 outline-none select-none ${lifted ? "opacity-40" : ""}`}
    >
      <div className="flex items-start gap-2.5">
        <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${done ? "bg-[#00b86b] text-white" : "border border-(--b-line)"}`}>
          {done && <Check className="size-3" strokeWidth={3} />}
        </span>
        <span className={`min-w-0 flex-1 text-left text-[13px] ${done ? "text-(--b-ink3) line-through" : "text-(--b-ink)"}`}>{title}</span>
        {time && (
          <span className="shrink-0 rounded-[4px] px-1.5 py-0.5 text-[11px] tabular-nums" style={{ background: `${BLUE}1f`, color: BLUE }}>
            {time}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2.5 text-(--b-ink3)">
        <NotebookPen className="size-3.5" />
        <Workflow className="size-3.5" />
        <Play className="size-3.5" />
        <span className="ml-auto rounded-[4px] bg-(--b-fill2) px-1.5 py-0.5 text-[11px] text-(--b-ink2) tabular-nums">0:00</span>
      </div>
    </div>
  );
}
