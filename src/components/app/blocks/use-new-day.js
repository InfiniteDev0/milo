"use client";

// Filing a day and starting the next: what got done goes into history, and the same blocks come back untouched.
// Only the midnight roll calls newDay — closing the day ends it, and never resets it.

import { useCallback, useMemo } from "react";
import { archiveTask } from "@/lib/db/blocks";
import { markDayEnded } from "@/lib/db/days";
import { writeNow } from "@/lib/db/sync";
import { labelFor, summarise } from "@/lib/day/history";
import { stampToday } from "@/lib/stamp";

export function useNewDay({
  blocks,
  tasks,
  sessions,
  day,
  journal,
  history,
  setHistory,
  setBlocks,
  setTasks,
  setSessions,
  setDay,
  setJournal,
  setRest,
  setPause,
  setFocusLocked,
  resetSent,
}) {
  // `forStamp` is the day being filed, yesterday at midnight; `log` is the already-closed interval list
  const newDay = useCallback(
    (forStamp = stampToday(), log = sessions) => {
      // endedAt is only set when you closed the day yourself, so that day files as already seen
      const entry = summarise(blocks, tasks, log, forStamp, labelFor(forStamp), day.endedAt ?? null);
      if (entry) {
        setHistory((prev) => [{ ...entry, journal }, ...prev.filter((h) => h.date !== entry.date)]);
      }

      // the same shape you built, with today's result wiped off it
      setBlocks(blocks.map((b) => ({ ...b, status: "todo", completedAt: undefined, dropped: false })));

      // a finished once-task leaves; archived, never deleted, because past days still name it
      const retiring = tasks.filter((t) => t.kind === "once" && t.status === "done");
      retiring.forEach((t) => writeNow(`task:${t.id}`, () => archiveTask(t.id)));
      const retired = new Set(retiring.map((t) => t.id));
      setTasks(tasks.filter((t) => !retired.has(t.id)).map((t) => ({ ...t, status: "todo" })));

      // yesterday's intervals keep their own dated rows; this only clears memory
      setSessions([]);
      resetSent();
      setDay({ startedAt: null, endedAt: null });
      setJournal({ morning: "", pause: "", night: "" });
      setRest(null);
      setPause(null);
      setFocusLocked(false);
    },
    [
      blocks,
      tasks,
      sessions,
      day.endedAt,
      journal,
      resetSent,
      setHistory,
      setBlocks,
      setTasks,
      setSessions,
      setDay,
      setJournal,
      setRest,
      setPause,
      setFocusLocked,
    ],
  );

  // yesterday, if midnight filed it and nobody has looked yet
  const unseen = useMemo(
    () => history.find((h) => h.endedAt == null && h.date !== stampToday()) ?? null,
    [history],
  );

  // reading what a day held is closing it, one day late
  const markSeen = useCallback(
    (stamp) => {
      setHistory((prev) => prev.map((h) => (h.date === stamp ? { ...h, endedAt: Date.now() } : h)));
      writeNow(`day:${stamp}`, () => markDayEnded(stamp));
    },
    [setHistory],
  );

  return { newDay, unseen, markSeen };
}
