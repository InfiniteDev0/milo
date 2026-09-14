"use client";

// The only irreversible thing in Milo. Two steps, and never beside a daily button.

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useBlocks } from "./blocks-provider";

export function DeleteBlock({ block, onDone }) {
  const { removeBlock, countsFor } = useBlocks();
  const [confirming, setConfirming] = useState(false);

  const counts = countsFor(block.id);
  const tasks = counts.todo + counts.doing + counts.done;

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-foreground/30 transition-colors hover:text-[#B4231F]"
      >
        <Trash2 className="size-3.5" />
        Delete permanently
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#B4231F]/20 bg-[#B4231F]/[0.03] p-3">
      {/* Says exactly what goes and exactly what stays. */}
      <p className="text-xs text-foreground/60">
        Delete <span className="font-medium">{block.name.replace(" Block", "")}</span>
        {tasks > 0 && <> and its {tasks} {tasks === 1 ? "task" : "tasks"}</>}? Days
        you already lived keep what happened in them. This cannot be undone.
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="flex-1 cursor-pointer rounded-lg border border-foreground/10 bg-card py-2 text-xs hover:bg-foreground/[0.03]"
        >
          Keep it
        </button>
        <button
          type="button"
          onClick={() => {
            removeBlock(block.id);
            onDone?.();
          }}
          className="flex-1 cursor-pointer rounded-lg bg-[#B4231F] py-2 text-xs font-medium text-white"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
