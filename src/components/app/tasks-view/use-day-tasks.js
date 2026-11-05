"use client";

/* The Tasks view's tasks, kept in the database (day_tasks, migration 0014).

   The view goes on changing its { [dayKey]: task[] } exactly as before; this
   watches it and catches the database up. After every change each task is
   compared with what was last sent for it — its words, its state, its day and
   its place in the day — and only the ones that differ are saved. A task that
   leaves every day (moved into a block) is deleted. One deleted with Undo is
   held until the Undo window closes, so it can come back untouched.

   Nothing is written until the real tasks have loaded, and a failed read never
   shows as empty days: the view says it couldn't reach them instead. */

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { dayTaskQueue, listDayTasks, trashDayTask } from "@/lib/db/day-tasks";
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

  useEffect(() => {
    if (!canWrite) return;
    const here = new Set();
    for (const [key, list] of Object.entries(tasks)) {
      list.forEach((t, i) => {
        here.add(t.id);
        const now = shape(t, key, i);
        if (saved.current.get(t.id) === now) return;
        saved.current.set(t.id, now);
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
