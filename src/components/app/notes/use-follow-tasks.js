"use client";

// A task's notes follow it to another block. Only notes still filed under the block it left move —
// one you deliberately filed somewhere else stays where you put it.

import { useEffect, useRef } from "react";
import { saveNoteSoon } from "@/lib/db/note-queue";

export const TASK_MOVED = "milo:task-moved";

export function useFollowTasks({ notes, setNotes, canWrite, userId }) {
  // the newest values, for a move that arrives between renders
  const live = useRef({ notes, canWrite, userId });
  useEffect(() => {
    live.current = { notes, canWrite, userId };
  });

  useEffect(() => {
    const follow = (e) => {
      const { taskId, from, to } = e.detail;
      const { notes: list, canWrite: can, userId: uid } = live.current;
      if (!can) return;

      const at = Date.now();
      const moved = list
        .filter((n) => n.taskId === taskId && (n.blockId ?? null) === from)
        .map((n) => ({ ...n, blockId: to, updatedAt: at }));
      if (moved.length === 0) return;

      const byId = new Map(moved.map((n) => [n.id, n]));
      setNotes((prev) => prev.map((n) => byId.get(n.id) ?? n));
      moved.forEach((n) => saveNoteSoon(uid, n, 0));
    };

    window.addEventListener(TASK_MOVED, follow);
    return () => window.removeEventListener(TASK_MOVED, follow);
  }, [setNotes]);
}
