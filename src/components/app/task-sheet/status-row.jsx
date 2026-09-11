"use client";

// No due date here, or anywhere. A task belongs to a block, not a day, so it can't be late.

import { shade } from "@/lib/shade";
import { COLUMNS, isQuick } from "../task-bits";
import { useBlocks } from "../blocks-provider";

export function StatusRow({ task, onDone }) {
  const { setTaskStatus, blockById } = useBlocks();

  // Same rule as the tick in the block sheet: no clock, nowhere for the time to go.
  const running = blockById[task.blockId]?.status === "ongoing";
  const steps = task.steps ?? [];
  const stepsAllDone = steps.length > 0 && steps.every((x) => x.done);

  if (!running) {
    return (
      <p className="py-1.5 text-center text-xs text-black/40">
        Start {blockById[task.blockId]?.name.replace(" Block", "")} to work on this.
      </p>
    );
  }

  return (
    <div className="flex gap-2">
      {Object.entries(COLUMNS)
        .filter(([id]) => id !== task.status)
        // a moment has no middle, so it isn't offered one here either
        .filter(([id]) => !(isQuick(task) && id === "doing"))
        .map(([id, col]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTaskStatus(task.id, id);
              if (id === "done") onDone?.();
            }}
            style={{
              backgroundColor: col.bg,
              color: col.ink,
              "--lift": shade(col.bg),
            }}
            // Mini version of Start this block, in the colour the status means.
            className={`milo-lift flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium ${
              // Offered once the breakdown is finished. Steps never roll up on their own.
              id === "done" && stepsAllDone ? "ring-2 ring-[#5e17eb]/40" : ""
            }`}
          >
            {col.title}
          </button>
        ))}
    </div>
  );
}
