"use client";

// How many of a block's tasks land on each weekday. It counts what's planned, never what's missing.

import { DAYS, onDay } from "@/lib/days";

export function BusyWeek({ tasks }) {
  return (
    <div className="flex gap-1" aria-label="Tasks on each weekday">
      {DAYS.map((d) => {
        const n = tasks.filter((t) => onDay(t, d.id)).length;
        return (
          <span
            key={d.id}
            title={`${d.name}: ${n} ${n === 1 ? "task" : "tasks"}`}
            // tinted in the block's own ink, so it reads on any block colour
            style={{ backgroundColor: n ? "color-mix(in oklab, currentColor 12%, transparent)" : "transparent" }}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-md py-1 text-[10px]"
          >
            <span className="opacity-60">{d.short}</span>
            <span className="font-medium tabular-nums">{n || "·"}</span>
          </span>
        );
      })}
    </div>
  );
}
