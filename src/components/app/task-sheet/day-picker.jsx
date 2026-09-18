"use client";

// The seven weekdays a task can appear on. None picked means any day.

import { DAYS } from "@/lib/days";

export function DayPicker({ days, onChange, compact = false }) {
  return (
    <div className="flex gap-1">
      {DAYS.map((d) => {
        const on = days.includes(d.id);
        return (
          <button
            key={d.id}
            type="button"
            aria-pressed={on}
            aria-label={d.name}
            title={d.name}
            onClick={(e) => {
              // a row that opens its task on click doesn't also open it here
              e.stopPropagation();
              onChange(on ? days.filter((x) => x !== d.id) : [...days, d.id]);
            }}
            className={`flex cursor-pointer items-center justify-center rounded-lg text-xs transition-colors ${
              compact ? "size-7" : "size-8 flex-1"
            } ${
              on
                ? "bg-foreground text-background"
                : "text-foreground/40 ring-1 ring-foreground/10 hover:ring-foreground/30"
            }`}
          >
            {d.short}
          </button>
        );
      })}
    </div>
  );
}
