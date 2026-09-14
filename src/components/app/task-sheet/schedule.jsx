"use client";

// Which days it appears on, and whether it comes back. See RESEARCH.md.

import { DAYS } from "@/lib/days";
import { useBlocks } from "../blocks-provider";

const KINDS = [
  ["routine", "Comes back", "Part of the block, every day it runs"],
  ["once", "Just once", "Done is done — it leaves the block"],
];

export function Schedule({ task }) {
  const { setTaskDays, setTaskKind } = useBlocks();
  const days = task.days ?? [];

  return (
    <div className="flex flex-col gap-2 border-t border-foreground/5 pt-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-foreground/45">Days</span>
        {/* No days is the default, so it says what that means. */}
        <span className="text-xs text-foreground/30">
          {days.length === 0 ? "Any day" : null}
        </span>
      </div>

      <div className="flex gap-1">
        {DAYS.map((d) => {
          const on = days.includes(d.id);
          return (
            <button
              key={d.id}
              type="button"
              aria-pressed={on}
              aria-label={d.name}
              onClick={() =>
                setTaskDays(
                  task.id,
                  on ? days.filter((x) => x !== d.id) : [...days, d.id],
                )
              }
              className={`flex size-8 flex-1 cursor-pointer items-center justify-center rounded-lg text-xs transition-colors ${
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

      <div className="flex gap-2 pt-1">
        {KINDS.map(([id, label, hint]) => (
          <button
            key={id}
            type="button"
            title={hint}
            onClick={() => setTaskKind(task.id, id)}
            className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-xs transition-colors ${
              (task.kind ?? "routine") === id
                ? "bg-foreground/[0.06] text-foreground"
                : "text-foreground/40 ring-1 ring-foreground/10 hover:text-foreground/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
