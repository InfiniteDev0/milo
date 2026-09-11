"use client";

// Shared by the board and the task sheet. Lives here so neither imports the other.

import { Check, CircleCheckIcon, CircleDot, CircleIcon } from "lucide-react";
import { DONE, DONE_INK, PAUSE, PAUSE_INK } from "@/lib/palette";

// Yellow is in motion, green is finished — the same meanings they carry everywhere else.
export const COLUMNS = {
  todo: {
    title: "To Do",
    icon: <CircleIcon className="size-4 text-black/40" />,
    bg: "#ECECEC",
    ink: "#2b2b2b",
  },
  doing: {
    title: "In Progress",
    icon: <CircleDot className="size-4 text-black/40" />,
    bg: PAUSE,
    ink: PAUSE_INK,
  },
  done: {
    title: "Done",
    icon: <CircleCheckIcon className="size-4 text-black/40" />,
    bg: DONE,
    ink: DONE_INK,
  },
};

export const QUICK_MINUTES = 5;

// A moment only if someone said it was short — never inferred from a missing estimate.
export const isQuick = (t) =>
  typeof t.minutes === "number" && t.minutes <= QUICK_MINUTES;

export function Tick({ done, onToggle, className = "size-5" }) {
  return (
    <button
      type="button"
      aria-label={done ? "Put it back" : "Done"}
      // click would open the sheet, pointerdown would arm a drag
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${
        done ? "bg-foreground text-white" : "ring-1 ring-black/20 hover:ring-black/50"
      } ${className}`}
    >
      {done && <Check className="size-3" strokeWidth={3} />}
    </button>
  );
}

export function StatusPill({ status, className = "" }) {
  const col = COLUMNS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
      style={{ backgroundColor: col.bg, color: col.ink }}
    >
      <span className="size-1.5 rounded-full bg-current opacity-50" />
      {col.title}
    </span>
  );
}

export function BlockChip({ block, className = "" }) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] ${className}`}
      style={{ background: `${block.bg}26`, color: block.ink }}
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ background: block.bg }} />
      {block.name.replace(" Block", "")}
    </span>
  );
}
