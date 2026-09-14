"use client";

// No due date here, or anywhere. A task belongs to a block, not a day, so it can't be late.

import { shade } from "@/lib/shade";
import { COLUMNS, Hint, isQuick } from "../task-bits";
import { useBlocks } from "../blocks-provider";

export function StatusRow({ task, onDone }) {
  const { setTaskStatus, blockById } = useBlocks();

  // Same rule as the tick: a block you have not started cannot be finished.
  const running = blockById[task.blockId]?.status === "ongoing";
  const done = task.status === "done";

  const steps = task.steps ?? [];
  const stepsAllDone = steps.length > 0 && steps.every((x) => x.done);

  return (
    <div className="flex gap-2">
      {Object.entries(COLUMNS)
        .filter(([id]) => id !== task.status)
        // a moment has no middle, so it isn't offered one here either
        .filter(([id]) => !(isQuick(task) && id === "doing"))
        .map(([id, col]) => {
          // To Do is always allowed — taking a done back claims nothing
          const blocked = !running && !done && id !== "todo";
          return (
            <Hint
              key={id}
              when={blocked}
              text="Start this block to work on it"
              className="flex-1"
            >
            <button
            type="button"
            disabled={blocked}
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
            className={`milo-lift flex w-full flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium disabled:cursor-default disabled:opacity-35 disabled:shadow-none ${
              blocked ? "" : "cursor-pointer"
            } ${
              // Offered once the breakdown is finished. Steps never roll up on their own.
              id === "done" && stepsAllDone ? "ring-2 ring-[#5e17eb]/40" : ""
            }`}
          >
            {col.title}
            </button>
            </Hint>
          );
        })}
    </div>
  );
}
