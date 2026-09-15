"use client";

// A task on that day. Anything that hasn't started can sit the day out, and come back with one press.

import { Check } from "lucide-react";

export function TaskLine({ task, ahead, skipped, canPlan, onSkip }) {
  // tomorrow nothing has happened yet, so today's ticks don't carry over
  const done = !ahead && task.status === "done";
  const doing = !ahead && task.status === "doing";
  const movable = canPlan && !done && !doing;

  return (
    <li className="flex items-center gap-3 rounded-lg bg-card px-3 py-2.5 ring-1 ring-foreground/8">
      {done ? (
        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-white">
          <Check className="size-2.5" strokeWidth={3.5} />
        </span>
      ) : (
        <span className="size-4 shrink-0 rounded-full border border-foreground/25" />
      )}

      <span
        className={`min-w-0 flex-1 truncate text-sm ${skipped || done ? "text-foreground/40" : ""}`}
      >
        {task.name}
      </span>

      {doing && <span className="shrink-0 text-[11px] text-foreground/45">In progress</span>}

      {movable && (
        <button
          type="button"
          onClick={() => onSkip(!skipped)}
          className="shrink-0 cursor-pointer rounded-md px-2 py-1 text-[11px] text-foreground/55 ring-1 ring-foreground/10 transition-colors hover:text-foreground"
        >
          {skipped ? "Bring it back" : ahead ? "Not tomorrow" : "Not today"}
        </button>
      )}
    </li>
  );
}
