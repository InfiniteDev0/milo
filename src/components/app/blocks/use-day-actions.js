"use client";

// Moving through the day: starting a block, pausing and picking the day back up, ending it, and skipping a rest.

import { useCallback } from "react";
import { closeSessions, openSession } from "@/lib/day/intervals";
import { workToday } from "@/lib/day/work";
import { playLock } from "@/lib/sound";

// starting a block starts the day, and reopens one you closed
const openDay = (d) =>
  !d.startedAt ? { ...d, startedAt: Date.now() } : d.endedAt ? { ...d, endedAt: null } : d;

export function useDayActions({
  tasks,
  blocks,
  sessions,
  pause,
  skippedToday,
  setDay,
  setPause,
  setRest,
  setSessions,
  setBlocks,
}) {
  // one card already in progress takes the clock; with several, block time is the honest answer
  const resuming = useCallback(
    (blockId) => {
      const doing = workToday(tasks, blockId, skippedToday).filter((t) => t.status === "doing");
      return doing.length === 1 ? doing[0].id : null;
    },
    [tasks, skippedToday],
  );

  // starting one pauses whatever was running: one block ongoing, always
  const start = useCallback(
    (id) => {
      setDay(openDay);
      setPause(null);
      setRest(null);

      // read from `blocks`, not inside an updater: React runs updaters twice in development
      const stopping = blocks.find((b) => b.id === id)?.status === "ongoing";
      setSessions((log) => (stopping ? closeSessions(log) : openSession(log, id, resuming(id))));
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, status: b.status === "ongoing" ? "paused" : "ongoing" }
            : b.status === "ongoing"
              ? { ...b, status: "paused" }
              : b,
        ),
      );
    },
    [blocks, resuming, setDay, setPause, setRest, setSessions, setBlocks],
  );

  // dropped into the day: it starts and moves to the front, so the line reads how the day actually went
  const startAndLead = useCallback(
    (id) => {
      setDay(openDay);
      setPause(null);
      setRest(null);
      setSessions((log) => openSession(log, id, resuming(id)));
      setBlocks((prev) => {
        const target = prev.find((b) => b.id === id);
        if (!target) return prev;
        const others = prev
          .filter((b) => b.id !== id)
          .map((b) => (b.status === "ongoing" ? { ...b, status: "paused" } : b));
        return [{ ...target, status: "ongoing" }, ...others];
      });
    },
    [resuming, setDay, setPause, setRest, setSessions, setBlocks],
  );

  // the clock stops the instant you press it; the note is asked for afterwards, never before
  const pauseDay = useCallback(() => {
    setSessions((log) => closeSessions(log));
    // remember the task as well as the block, so coming back lands on the same line
    const current = blocks.find((b) => b.status === "ongoing");
    setPause({
      pausedAt: Date.now(),
      blockId: current?.id ?? null,
      taskId: sessions.find((x) => x.endedAt === null)?.taskId ?? null,
      note: "",
    });
    setBlocks((prev) => prev.map((b) => (b.status === "ongoing" ? { ...b, status: "paused" } : b)));
    setRest(null);
  }, [blocks, sessions, setSessions, setPause, setBlocks, setRest]);

  // the note you leave yourself; a plan for the unfinished thing is what lets you actually leave
  const setPauseNote = useCallback(
    (note) => setPause((p) => (p === null ? p : { ...p, note })),
    [setPause],
  );

  const resumeDay = useCallback(() => {
    if (pause?.blockId) {
      // back to the same line, not just the same room
      setSessions((log) => openSession(log, pause.blockId, pause.taskId ?? null));
      setBlocks((prev) => prev.map((b) => (b.id === pause.blockId ? { ...b, status: "ongoing" } : b)));
      // coming back happened, so it gets the lock-in sound; pausing gets none
      playLock();
      // going back in reopens a closed day, the same as starting a block
      setDay((d) => (d.endedAt ? { ...d, endedAt: null } : d));
    }
    setPause(null);
  }, [pause, setSessions, setBlocks, setDay, setPause]);

  // closing the day on purpose; the timestamp tells the next morning you've already seen it
  const endDay = useCallback(() => {
    setSessions((log) => closeSessions(log));
    setBlocks((prev) => prev.map((b) => (b.status === "ongoing" ? { ...b, status: "paused" } : b)));
    setDay((d) => ({ ...d, endedAt: Date.now() }));
    setRest(null);
  }, [setSessions, setBlocks, setDay, setRest]);

  const skipRest = useCallback(() => setRest(null), [setRest]);

  return { start, startAndLead, pauseDay, setPauseNote, resumeDay, endDay, skipRest };
}
