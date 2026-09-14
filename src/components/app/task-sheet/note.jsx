"use client";

// Scratch space. Separate from `reason`, which is why you're doing this at all.

import { useBlocks } from "../blocks-provider";

export function Note({ task }) {
  const { setTaskNote } = useBlocks();

  return (
    <div className="flex flex-col gap-1.5 border-t border-foreground/5 pt-3">
      <label htmlFor="milo-task-note" className="text-xs text-foreground/45">
        Note
      </label>
      <textarea
        id="milo-task-note"
        value={task.note ?? ""}
        onChange={(e) => setTaskNote(task.id, e.target.value)}
        placeholder="Anything worth remembering next time you pick this up."
        rows={3}
        className="w-full resize-none rounded-lg border border-foreground/10 px-3 py-2 text-sm outline-none placeholder:text-foreground/25 focus:border-foreground/30"
      />
    </div>
  );
}
