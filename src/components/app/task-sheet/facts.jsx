"use client";

// Estimate and status. The block moved to the header, where the title is.

import { StatusPill } from "../task-bits";
import { useBlocks } from "../blocks-provider";

export function Facts({ task }) {
  const { setTaskMinutes } = useBlocks();

  return (
    <dl className="flex flex-col gap-3 text-sm">
      <div className="flex items-center justify-between gap-4">
        {/* while the clock is on this task, Milo says once when this much time has passed */}
        <dt className="text-foreground/45" title="Milo lets you know when the clock has been on it this long">
          Timer
        </dt>
        <dd>
          {/* Blank until you fill it in — Milo never guesses a duration. */}
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={task.minutes ?? ""}
            onChange={(e) =>
              setTaskMinutes(
                task.id,
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            placeholder="—"
            aria-label="Timer, in minutes"
            className="w-16 rounded-lg border border-foreground/10 px-2 py-1 text-right text-sm outline-none placeholder:text-foreground/25 focus:border-foreground/30"
          />
          <span className="pl-2 text-foreground/45">min</span>
        </dd>
      </div>

      <div className="flex items-center justify-between gap-4">
        <dt className="text-foreground/45">Status</dt>
        <dd>
          <StatusPill status={task.status} />
        </dd>
      </div>
    </dl>
  );
}
