"use client";

// A small month to pick a day from: ‹ month › along the top, the weekdays, then the days.
// The picked day is filled, today has a ring. Any day can be picked: a day is only a column.

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const ARROW = "flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground";

export function MiniCalendar({ value, onPick }) {
  const [month, setMonth] = useState(new Date(value.getFullYear(), value.getMonth(), 1));
  const y = month.getFullYear();
  const m = month.getMonth();
  const today = new Date().toDateString();
  // blanks before the 1st, then each day
  const cells = [...Array(month.getDay()).fill(null), ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => new Date(y, m, i + 1))];

  return (
    <div className="flex w-64 flex-col gap-2">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setMonth(new Date(y, m - 1, 1))} aria-label="Previous month" className={ARROW}>
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-medium">{month.toLocaleDateString([], { month: "long", year: "numeric" })}</span>
        <button type="button" onClick={() => setMonth(new Date(y, m + 1, 1))} aria-label="Next month" className={ARROW}>
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="py-1 text-[11px] font-medium text-muted-foreground">
            {d}
          </span>
        ))}
        {cells.map((d, i) =>
          d ? (
            <button
              key={i}
              type="button"
              onClick={() => onPick(d)}
              className={cn(
                "flex h-8 cursor-pointer items-center justify-center rounded-md text-sm tabular-nums transition-colors",
                d.toDateString() === value.toDateString()
                  ? "bg-foreground font-medium text-background"
                  : cn("hover:bg-foreground/8", d.toDateString() === today && "ring-1 ring-inset ring-foreground/30"),
              )}
            >
              {d.getDate()}
            </button>
          ) : (
            <span key={i} />
          ),
        )}
      </div>
    </div>
  );
}
