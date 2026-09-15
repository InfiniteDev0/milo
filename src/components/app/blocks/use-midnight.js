"use client";

// Midnight: the day that ended is filed, the new one starts with its own plan, and a block you're still in carries on.
// A poll, not a timer to 00:00 — laptops sleep, and a poll corrects itself the moment the machine wakes. It never asks.

import { useEffect, useRef } from "react";
import { closeAnyOpen } from "@/lib/db/days";
import { loadPlans } from "@/lib/db/plans";
import { writeNow } from "@/lib/db/sync";
import { STALE, closeSessions, lastNight, lastSeen, openSession } from "@/lib/day/intervals";
import { nextStamp, stampToday } from "@/lib/stamp";

export function useMidnight({
  hydrated,
  sessions,
  newDay,
  plans,
  setSessions,
  setTodayStamp,
  setBlocks,
  setPlans,
  setPlansReady,
  setDay,
}) {
  const dayStamp = useRef(stampToday());

  // armed once: the live values ride in on a ref, so the timer isn't rebuilt on every checkbox tick
  const latest = useRef({ sessions: [], newDay: null, plans: {} });
  useEffect(() => {
    latest.current = { sessions, newDay, plans };
  }, [sessions, newDay, plans]);

  useEffect(() => {
    if (!hydrated) return;

    const check = () => {
      const now = stampToday();
      if (now === dayStamp.current) return;

      const closing = dayStamp.current;
      dayStamp.current = now;
      const { sessions: log, newDay: roll } = latest.current;

      // awake at 00:30, the interval closes at 23:59:59 and reopens today; asleep, it closes when you were last seen
      const seen = lastSeen();
      const awake = Date.now() - seen < STALE;
      const open = log.find((x) => x.endedAt === null);
      const carry = awake && open ? { blockId: open.blockId, taskId: open.taskId } : null;

      // min, not max: the hours after you walked away were not work
      const closeAt = awake ? lastNight() : Math.min(seen, lastNight());
      const closed = closeSessions(log, closeAt);

      // straight at the database: newDay empties the list in this same batch, before the diff could see the close
      writeNow(`sessions:midnight:${closing}`, () => closeAnyOpen(closeAt));
      setSessions(closed);

      // filed under the day it happened on, not the one we woke up in
      roll(closing, closed);
      setTodayStamp(now);

      // the new day's plan: blocks set aside for it step out now, never the block you're still in
      const setAside = (aside) =>
        setBlocks((prev) =>
          prev.map((b) =>
            aside.includes(b.id) && b.status === "todo" && b.id !== carry?.blockId
              ? { ...b, dropped: true }
              : b,
          ),
        );
      setAside(latest.current.plans[now]?.setAside ?? []);

      // the day after is fetched now, and a change made on another device comes with it
      loadPlans([now, nextStamp(now)])
        .then((fresh) => {
          setPlans(fresh);
          setPlansReady(true);
          setAside(fresh[now]?.setAside ?? []);
        })
        .catch((err) => console.warn("[milo] could not load your day plans", err));

      if (carry) {
        setDay({ startedAt: Date.now(), endedAt: null });
        setBlocks((prev) => prev.map((b) => (b.id === carry.blockId ? { ...b, status: "ongoing" } : b)));
        setSessions((list) => openSession(list, carry.blockId, carry.taskId));
      }
    };

    const t = setInterval(check, 30000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", check);
    };
  }, [hydrated, setSessions, setTodayStamp, setBlocks, setPlans, setPlansReady, setDay]);
}
