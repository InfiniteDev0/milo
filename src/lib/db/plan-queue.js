"use client";

// Saves day plans so the newest version always wins: one request per day at a time,
// and every save — retries included — sends the latest plan, never the one that failed.

import { savePlan } from "./plans";

const BACKOFF = [1000, 3000, 8000, 20000];

// stamp -> the newest plan, and where its save has got to
const days = new Map();

const entry = (stamp) => {
  if (!days.has(stamp)) days.set(stamp, { latest: null, userId: null, timer: null, inflight: false, attempts: 0 });
  return days.get(stamp);
};

async function flush(stamp) {
  const e = entry(stamp);
  // one on the wire already: when it settles it sends whatever is newest
  if (e.inflight || !e.latest) return;
  e.inflight = true;
  const sent = e.latest;
  try {
    const { error } = (await savePlan(e.userId, stamp, sent)) ?? {};
    if (error) throw error;
    e.attempts = 0;
    e.inflight = false;
    // changed again while that was saving — send that too
    if (e.latest !== sent) flush(stamp);
  } catch (err) {
    e.inflight = false;
    const delay = BACKOFF[Math.min(e.attempts, BACKOFF.length - 1)];
    e.attempts += 1;
    console.warn(`[milo] plan save failed (${stamp}), retrying in ${delay}ms`, err);
    clearTimeout(e.timer);
    e.timer = setTimeout(() => {
      e.timer = null;
      flush(stamp);
    }, delay);
  }
}

// a toggle is one decision, so it goes out straight away
export function savePlanSoon(userId, stamp, plan) {
  const e = entry(stamp);
  e.latest = plan;
  e.userId = userId;
  clearTimeout(e.timer);
  e.timer = setTimeout(() => {
    e.timer = null;
    flush(stamp);
  }, 0);
}
