"use client";

/* The block that's running, in its own colour.
 *
 * Reads the same provider the rail writes to, so starting a block in the rail
 * changes this card. Nothing is "current" when no block is running — the empty
 * state says so plainly rather than showing the last one as if it were live.
 */

import { useBlocks } from "./blocks-provider";
import { TaskRings } from "./task-rings";

export function OngoingBlockCard() {
  const { ongoing } = useBlocks();

  if (!ongoing) {
    return (
      <div className="flex h-12 w-[300px] items-center rounded-md border border-dashed border-foreground/15 px-3">
        <p className="text-sm text-foreground/40">Nothing running. Start a block.</p>
      </div>
    );
  }

  const total = ongoing.todo + ongoing.doing + ongoing.done;

  return (
    <div
      className="rounded-md px-3 py-1 transition-colors duration-300 motion-reduce:transition-none"
      // ink is what TaskRings inherits through currentColor, so the block's
      // colour reaches the rings without them knowing anything about blocks
      style={{ background: ongoing.bg, color: ongoing.ink }}
    >
      <div className="flex h-10 w-[300px] items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <h2 className="truncate text-sm font-medium">{ongoing.name}</h2>
          <span className="text-xs opacity-60">
            {total} {total === 1 ? "task" : "tasks"}
          </span>
        </div>

        <TaskRings
          todo={ongoing.todo}
          doing={ongoing.doing}
          done={ongoing.done}
        />
      </div>
    </div>
  );
}
