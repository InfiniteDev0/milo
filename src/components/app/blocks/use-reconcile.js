"use client";

// A block finishes, or reopens, whenever its work for today changes — not only when its last task is ticked.

import { useCallback } from "react";
import { playBlock } from "@/lib/sound";
import { closeSessions } from "@/lib/day/intervals";
import { blockFinished, moreToCome, workToday } from "@/lib/day/work";

export function useReconcile({
  blocks,
  setBlocks,
  skippedToday,
  holdMood,
  restMinutes,
  setFocusLocked,
  setSessions,
  setRest,
}) {
  return useCallback(
    // `skipped` is today's plan; a skip that just changed hands in the new one
    (list, skipped = skippedToday) => {
      // worked out before the state changes, while a block that just finished can still be told apart
      const finishing = blocks.filter(
        (b) => !b.dropped && !b.archived && b.status !== "done" && blockFinished(list, b.id, skipped),
      );

      setBlocks((prev) =>
        prev.map((b) => {
          // a set-aside block stays set aside: that was a decision about today
          if (b.dropped || b.archived) return b;
          const mine = workToday(list, b.id, skipped);
          if (mine.length === 0) return b;

          const all = mine.every((t) => t.status === "done");
          if (all && b.status !== "done") return { ...b, status: "done", completedAt: Date.now() };
          // reopening returns it to the line, not to the clock
          if (!all && b.status === "done") return { ...b, status: "todo", completedAt: undefined };
          return b;
        }),
      );

      if (finishing.length === 0) return;

      // a sound for something that happened; none for a block reopening
      playBlock();
      holdMood("proud", 4000);

      // the clock and the rest only follow a block you were actually in
      const running = finishing.find((b) => b.status === "ongoing");
      if (!running) return;

      setFocusLocked(false);
      setSessions((log) => closeSessions(log));
      if (restMinutes > 0 && moreToCome(blocks, running.id, list, skipped)) {
        setRest({ until: Date.now() + restMinutes * 60000, blockName: running.name });
      }
    },
    [blocks, holdMood, restMinutes, skippedToday, setBlocks, setFocusLocked, setSessions, setRest],
  );
}
