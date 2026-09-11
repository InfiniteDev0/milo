"use client";

// Estimate and status. The block moved to the header, where the title is.

import { StatusPill } from "../task-bits";
import { useBlocks } from "../blocks-provider";

export function Facts({ task }) {
  const { setTaskMinutes } = useBlocks();

  return (
    <dl className="flex flex-col gap-3 text-sm">
      <div className="flex items-center justify-between gap-4">
        <dt className="text-black/45">Takes</dt>
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
            aria-label="How long it takes, in minutes"
            className="w-16 rounded-lg border border-black/10 px-2 py-1 text-right text-sm outline-none placeholder:text-black/25 focus:border-black/30"
          />
          <span className="pl-2 text-black/45">min</span>
        </dd>
      </div>

      <div className="flex items-center justify-between gap-4">
        <dt className="text-black/45">Status</dt>
        <dd>
          <StatusPill status={task.status} />
        </dd>
      </div>
    </dl>
  );
}
