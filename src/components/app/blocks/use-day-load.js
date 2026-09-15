"use client";

// Loading the day: what you shaped, today's row laid over it, the days behind, and today's and tomorrow's plans.
// A failed load says so through `loadFailed` and never passes for an empty account.

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadShape } from "@/lib/db/blocks";
import { loadDay, loadHistory, loadSessions } from "@/lib/db/days";
import { loadPlans } from "@/lib/db/plans";
import { loadProfile } from "@/lib/db/profile";
import { historyFromRows } from "@/lib/day/history";
import { openSession, recover } from "@/lib/day/intervals";
import { nextStamp, stampToday } from "@/lib/stamp";

export function useDayLoad({
  setBlocks,
  setTasks,
  setProfile,
  setRestMinutes,
  setDay,
  setPause,
  setJournal,
  setSessions,
  setHistory,
  setTodayStamp,
  setPlans,
  setPlansReady,
}) {
  // false until the first read settles; every write waits on it
  const [hydrated, setHydrated] = useState(false);
  // absence and failure are different facts: a read that failed must never look like a brand-new account
  const [loadFailed, setLoadFailed] = useState(false);
  // bumped by retry(), the only reason the load has a dependency
  const [attempt, setAttempt] = useState(0);
  // who we are writing as; null until the session resolves
  const [userId, setUserId] = useState(null);

  const retry = useCallback(() => {
    setLoadFailed(false);
    setHydrated(false);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const {
          data: { user },
        } = await createClient().auth.getUser();
        if (!alive) return;
        setUserId(user?.id ?? null);
        if (!user) return;

        // what you shaped; what happened today is laid over it below, never stored with it
        const [shape, saved] = await Promise.all([loadShape(), loadProfile()]);
        if (!alive) return;
        setBlocks(shape.blocks);
        setTasks(shape.tasks);
        if (saved) {
          setProfile({ year: saved.year, month: saved.month });
          setRestMinutes(saved.restMinutes);
        }

        const stamp = stampToday();
        const [today, past, log, ahead] = await Promise.all([
          loadDay(stamp),
          loadHistory(stamp),
          loadSessions(stamp),
          // plans fail on their own: a plan that can't be read never stops the day loading
          loadPlans([stamp, nextStamp(stamp)]).catch((err) => {
            console.warn("[milo] could not load your day plans", err);
            return null;
          }),
        ]);
        if (!alive) return;

        setTodayStamp(stamp);
        setPlans(ahead ?? {});
        setPlansReady(ahead !== null);
        // blocks set aside for today ahead of time join today's own set-asides
        const asideAhead = ahead?.[stamp]?.setAside ?? [];

        if (today) {
          setDay({ startedAt: today.startedAt, endedAt: today.endedAt ?? null });
          // a pause lives on the day row, so it outlives the tab but not the day
          setPause(today.pause ?? null);
          setJournal({ morning: "", pause: "", night: "", ...today.journal });
          setBlocks((prev) =>
            prev.map((b) => {
              const status = today.blockState[b.id]?.status ?? "todo";
              return {
                ...b,
                status,
                completedAt: today.blockState[b.id]?.completedAt ?? undefined,
                // a block that already ran today stays in it, whatever was planned
                dropped:
                  today.dropped.includes(b.id) || (status === "todo" && asideAhead.includes(b.id)),
              };
            }),
          );
          setTasks((prev) => prev.map((t) => ({ ...t, status: today.taskState[t.id] ?? "todo" })));
        } else {
          // no row yet today: everything starts untouched
          setBlocks((prev) =>
            prev.map((b) => ({ ...b, status: "todo", dropped: asideAhead.includes(b.id) })),
          );
          setTasks((prev) => prev.map((t) => ({ ...t, status: "todo" })));
        }

        // a running block with no clock can't exist: open an interval now, without inventing the lost hours
        const restored = recover(log);
        const ongoingId = Object.entries(today?.blockState ?? {}).find(
          ([, v]) => v?.status === "ongoing",
        )?.[0];
        setSessions(
          ongoingId && !restored.some((x) => x.endedAt === null)
            ? openSession(restored, ongoingId)
            : restored,
        );

        // the record behind you: a day where nothing finished is absent, never a zero
        setHistory(historyFromRows(past, new Map(shape.blocks.map((b) => [b.id, b]))));
      } catch (err) {
        // offline, an expired session, or a migration not run yet — never conclude the account is empty
        if (alive) setLoadFailed(true);
        console.warn("[milo] could not load your blocks", err);
      } finally {
        if (alive) setHydrated(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, [
    attempt,
    setBlocks,
    setTasks,
    setProfile,
    setRestMinutes,
    setDay,
    setPause,
    setJournal,
    setSessions,
    setHistory,
    setTodayStamp,
    setPlans,
    setPlansReady,
  ]);

  return { hydrated, loadFailed, retry, userId };
}
