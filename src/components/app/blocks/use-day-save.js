"use client";

// Writing the day: your profile, today's row, the heartbeat, the interval log and the lineup's order.
// A failed read must never produce a write, so every effect here waits for a load that actually worked.

import { useCallback, useEffect, useRef } from "react";
import { saveOrder } from "@/lib/db/blocks";
import { closeAnyOpen, closeSessionRow, openSessionRow, saveDay } from "@/lib/db/days";
import { saveProfile } from "@/lib/db/profile";
import { queueWrite, writeNow } from "@/lib/db/sync";
import { beat } from "@/lib/day/intervals";
import { stampToday } from "@/lib/stamp";

export function useDaySave({
  hydrated,
  loadFailed,
  userId,
  profile,
  restMinutes,
  day,
  blocks,
  tasks,
  journal,
  pause,
  sessions,
}) {
  useEffect(() => {
    if (!hydrated || !userId || !profile) return;
    queueWrite("profile", () => saveProfile(userId, { ...profile, restMinutes }));
  }, [hydrated, userId, profile, restMinutes]);

  // the day, upserted whole to its own row; queued, because only where it settles matters
  useEffect(() => {
    if (!hydrated || !userId || loadFailed) return;

    const stamp = stampToday();
    queueWrite(`day:${stamp}`, () =>
      saveDay(userId, stamp, {
        startedAt: day.startedAt,
        endedAt: day.endedAt,
        blockState: Object.fromEntries(
          blocks
            .filter((b) => b.status && b.status !== "todo")
            .map((b) => [b.id, { status: b.status, completedAt: b.completedAt ?? null }]),
        ),
        taskState: Object.fromEntries(
          tasks.filter((t) => t.status && t.status !== "todo").map((t) => [t.id, t.status]),
        ),
        dropped: blocks.filter((b) => b.dropped).map((b) => b.id),
        journal,
        pause,
      }),
    );
  }, [hydrated, loadFailed, userId, blocks, tasks, day, journal, pause]);

  // the heartbeat, so a tab that dies is trimmed back to the last moment someone was here
  const running = sessions.some((x) => x.endedAt === null);
  useEffect(() => {
    if (!running) return;
    beat();
    const t = setInterval(beat, 15000);
    return () => clearInterval(t);
  }, [running]);

  // intervals reach the database from here, diffed against what was last sent, so every transition is covered
  const sentSessions = useRef(new Map());
  useEffect(() => {
    if (!hydrated || !userId || loadFailed) return;

    for (const x of sessions) {
      /* A row read from the database is already there. Treating it as new closed the running interval at its own
         start time on every load (zero minutes), so a refresh erased the stretch you were in. */
      if (x.stored && !sentSessions.current.has(x.id)) sentSessions.current.set(x.id, x.storedEndedAt);
      const sent = sentSessions.current.get(x.id);

      if (sent === undefined) {
        sentSessions.current.set(x.id, x.endedAt);
        // close anything the server still has open first, or the one-open-interval index refuses the insert
        writeNow(`session:${x.id}`, async () => {
          if (x.endedAt === null) await closeAnyOpen(x.startedAt);
          const res = await openSessionRow(userId, x);
          if (!res.error && x.endedAt !== null) return closeSessionRow(x);
          return res;
        });
        continue;
      }

      if (sent === null && x.endedAt !== null) {
        sentSessions.current.set(x.id, x.endedAt);
        writeNow(`session:${x.id}`, () => closeSessionRow(x));
      }
    }
  }, [hydrated, loadFailed, userId, sessions]);

  // a new day starts a new log, so nothing from yesterday counts as already sent
  const resetSent = useCallback(() => {
    sentSessions.current = new Map();
  }, []);

  // the order you dragged the lineup into; queued, since only the last arrangement is true
  const order = blocks.map((b) => b.id).join(",");
  useEffect(() => {
    if (!hydrated || !userId || blocks.length === 0) return;
    queueWrite("blocks:order", () => saveOrder(blocks.filter((b) => !b.archived)), { wait: 1200 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  return { resetSent };
}
