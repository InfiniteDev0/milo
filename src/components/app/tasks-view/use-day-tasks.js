"use client";

/* The Tasks view's tasks, kept in the database (day_tasks, migration 0014).

   The view goes on changing its { [dayKey]: task[] } exactly as before; this
   watches it and catches the database up. After every change each task is
   compared with what was last sent for it — its words, its state, its day and
   its place in the day — and only the ones that differ are saved. A task that
   leaves every day (moved into a block) is deleted. One deleted with Undo is
   held until the Undo window closes, so it can come back untouched.

   Nothing is written until the real tasks have loaded, and a failed read never
   shows as empty days: the view says it couldn't reach them instead.

   A clock is only ever counted from what was seen (TIME.md). While one runs the
   heartbeat beats; a clock found running at load with no recent beat (the tab
   died, the lid closed) is stopped at the last moment someone was here — never
   left counting the night. Leaving the view puts a running clock away too, so a
   day task's clock can't run on beside a block. */

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { dayTaskQueue, listDayTasks, trashDayTask } from "@/lib/db/day-tasks";
import { STALE, beat, lastSeen } from "@/lib/day/intervals";
import { writeNow } from "@/lib/db/sync";

// everything a saved row holds, as one string: when it changes, the row is saved again
const shape = (t, key, position) =>
  JSON.stringify([key, position, t.title, t.done, t.minutes ?? null, t.actualMs ?? 0, t.startedAt ?? null, t.note ?? "", t.steps ?? [], t.repeat ?? "none", t.doneOn ?? {}, t.categoryId ?? null, t.repeatRule ?? null, t.atTime ?? null]);

export function useDayTasks() {
  const [tasks, setTasks] = useState({});
  const [userId, setUserId] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  // id -> what was last sent; ids deleted but still inside their Undo window
  const saved = useRef(new Map());
  const held = useRef(new Set());

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await createClient().auth.getUser();
        const byDay = await listDayTasks();
        if (!alive) return;
        for (const [key, list] of Object.entries(byDay)) list.forEach((t, i) => saved.current.set(t.id, shape(t, key, i)));
        // a clock left running with nobody seen since: stopped at the last moment someone was here.
        // Changing it here (after saved is filled) means the save effect sends the stopped version
        const seen = lastSeen();
        if (Date.now() - seen > STALE) {
          for (const list of Object.values(byDay)) {
            list.forEach((t, i) => {
              if (!t.startedAt) return;
              list[i] = { ...t, actualMs: (t.actualMs ?? 0) + Math.max(0, Math.min(seen, Date.now()) - t.startedAt), startedAt: null };
            });
          }
        }
        setUserId(user?.id ?? null);
        setTasks(byDay);
      } catch (err) {
        // offline, or migration 0014 not applied yet — never conclude the days are empty
        if (alive) setLoadFailed(true);
        console.warn("[milo] could not load your day tasks", err);
      } finally {
        if (alive) setHydrated(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const canWrite = hydrated && !loadFailed && userId != null;

  // the heartbeat, while a day task's clock runs, so a tab that dies is trimmed back to when it was seen
  const running = Object.values(tasks).some((list) => list.some((t) => t.startedAt));
  useEffect(() => {
    if (!running) return;
    beat();
    const t = setInterval(beat, 15000);
    return () => clearInterval(t);
  }, [running]);

  // leaving the view: a running clock is banked and put away, straight to the database
  const latestTasks = useRef(tasks);
  const writer = useRef(null);
  useEffect(() => {
    latestTasks.current = tasks;
    writer.current = canWrite ? userId : null;
  });
  useEffect(
    () => () => {
      const who = writer.current;
      if (!who) return;
      for (const [key, list] of Object.entries(latestTasks.current)) {
        list.forEach((t, i) => {
          if (!t.startedAt) return;
          const stopped = { ...t, actualMs: (t.actualMs ?? 0) + Math.max(0, Date.now() - t.startedAt), startedAt: null };
          dayTaskQueue.save(t.id, [who, stopped, key, i], 0);
        });
      }
    },
    [],
  );

  // when this tab last changed something; a reload on coming back waits until it's quiet
  const lastChange = useRef(0);

  useEffect(() => {
    if (!canWrite) return;
    const here = new Set();
    for (const [key, list] of Object.entries(tasks)) {
      list.forEach((t, i) => {
        here.add(t.id);
        const now = shape(t, key, i);
        if (saved.current.get(t.id) === now) return;
        saved.current.set(t.id, now);
        lastChange.current = Date.now();
        // typing in a note or a step is a burst of changes: one save once it settles
        dayTaskQueue.save(t.id, [userId, t, key, i]);
      });
    }
    for (const id of [...saved.current.keys()]) {
      if (here.has(id) || held.current.has(id)) continue;
      saved.current.delete(id);
      dayTaskQueue.remove(id);
    }
  }, [tasks, canWrite, userId]);

  // another tab may have changed things: coming back to this one reads them again — unless something
  // was changed here in the last few seconds (still saving) or a delete is waiting on its Undo
  useEffect(() => {
    if (!canWrite) return;
    const onBack = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastChange.current < 4000 || held.current.size > 0) return;
      listDayTasks()
        .then((byDay) => {
          saved.current = new Map();
          for (const [key, list] of Object.entries(byDay)) list.forEach((t, i) => saved.current.set(t.id, shape(t, key, i)));
          setTasks(byDay);
        })
        .catch(() => {});
    };
    document.addEventListener("visibilitychange", onBack);
    return () => document.removeEventListener("visibilitychange", onBack);
  }, [canWrite]);

  // a delete with Undo: hold(id) before it leaves the day, then release(id, gone) when the toast settles
  const hold = useCallback((id) => held.current.add(id), []);
  const release = useCallback((id, gone) => {
    held.current.delete(id);
    if (!gone) return;
    saved.current.delete(id);
    // deleted on purpose: to Trash, not gone for good
    writeNow(`day-task-trash:${id}`, () => trashDayTask(id));
  }, []);

  return { tasks, setTasks, hydrated, loadFailed, canWrite, hold, release };
}
