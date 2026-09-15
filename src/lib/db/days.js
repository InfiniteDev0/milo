"use client";

/* The day, against the database.
 *
 * A `days` row is everything that is true about one date and nothing that
 * outlives it: which block was running, which tasks are ticked, what was set
 * aside, and the three journal entries.
 *
 * That separation is the reason the daily reset is safe. Resetting a day
 * deletes nothing you shaped — it just means there is no row for today yet.
 *
 * `stamp` is the browser's local date, never the server's. The day rolls over
 * at the user's midnight; a UTC date would end some people's day at 7pm.
 */

import { createClient } from "@/lib/supabase/client";

const dayFromRow = (r) => ({
  stamp: r.stamp,
  startedAt: r.started_at ? Date.parse(r.started_at) : null,
  /* When it was closed ON PURPOSE. Null means it was filed by midnight and
     nobody has looked at it since — which is precisely the day the morning
     recap exists for. */
  endedAt: r.ended_at ? Date.parse(r.ended_at) : null,
  blockState: r.block_state ?? {},
  taskState: r.task_state ?? {},
  dropped: r.dropped ?? [],
  journal: r.journal ?? { morning: "", pause: "", night: "" },
  /* Null when the day is running. Not `?? {}` — an empty object would
     make "paused, nothing written" indistinguishable from "not paused". */
  pause: r.pause ?? null,
});

export async function loadDay(stamp) {
  const db = createClient();
  const { data, error } = await db
    .from("days")
    .select("stamp, started_at, ended_at, block_state, task_state, dropped, journal, pause")
    .eq("stamp", stamp)
    .maybeSingle();

  if (error) throw error;
  return data ? dayFromRow(data) : null;
}

/* One row per user per day, so every write is an upsert on that pair. Writing
   the whole row each time is right here: it is a handful of small fields, and
   patching them separately would let two of them disagree. */
export function saveDay(userId, stamp, day) {
  const db = createClient();
  return db.from("days").upsert(
    {
      user_id: userId,
      stamp,
      started_at: day.startedAt ? new Date(day.startedAt).toISOString() : null,
      ended_at: day.endedAt ? new Date(day.endedAt).toISOString() : null,
      block_state: day.blockState ?? {},
      task_state: day.taskState ?? {},
      dropped: day.dropped ?? [],
      journal: day.journal ?? {},
      pause: day.pause ?? null,
    },
    { onConflict: "user_id,stamp" },
  );
}

/* ------------------------------------------------------------- history -- */

/* Past days, newest first, for the month calendar and the date picker. Today
   is excluded — it is live state, not a record, and reading it from here would
   show a version of today that is however stale the last write left it. */
export async function loadHistory(exceptStamp, limit = 120) {
  const db = createClient();
  const { data, error } = await db
    .from("days")
    .select("stamp, started_at, ended_at, block_state, task_state, journal")
    .neq("stamp", exceptStamp)
    .order("stamp", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/* Marks a past day as seen. Dismissing the morning recap is what calls this:
   reading what yesterday held IS closing it, one day late. */
export function markDayEnded(stamp, at = Date.now()) {
  const db = createClient();
  return db
    .from("days")
    .update({ ended_at: new Date(at).toISOString() })
    .eq("stamp", stamp);
}

/* ------------------------------------------------------------ sessions -- */

/* The interval log. See TIME.md.
 *
 * The database enforces one open interval per user with a partial unique
 * index, so a second tab cannot start a second clock — the insert fails with
 * 23505 rather than quietly producing two. `closeOpen` before `open` is what
 * keeps that from happening in the first place. */

export async function loadSessions(stamp) {
  const db = createClient();
  const { data, error } = await db
    .from("sessions")
    .select("id, stamp, block_id, task_id, started_at, ended_at")
    .eq("stamp", stamp)
    .order("started_at");

  if (error) throw error;
  return data.map((r) => ({
    id: r.id,
    day: r.stamp,
    blockId: r.block_id,
    taskId: r.task_id,
    startedAt: Date.parse(r.started_at),
    endedAt: r.ended_at ? Date.parse(r.ended_at) : null,
    // already in the database: the sync starts from what it holds and never inserts this row again
    stored: true,
    storedEndedAt: r.ended_at ? Date.parse(r.ended_at) : null,
  }));
}

export function openSessionRow(userId, session) {
  const db = createClient();
  return db.from("sessions").insert({
    id: session.id,
    user_id: userId,
    stamp: session.day,
    block_id: session.blockId,
    task_id: session.taskId,
    started_at: new Date(session.startedAt).toISOString(),
  });
}

export function closeSessionRow(session) {
  const db = createClient();
  return db
    .from("sessions")
    .update({ ended_at: new Date(session.endedAt).toISOString() })
    .eq("id", session.id);
}

/* Belt and braces for the unique index: close anything the client doesn't know
   about before opening a new interval. A tab that died mid-session leaves a row
   open that this client never loaded. */
export function closeAnyOpen(at = Date.now()) {
  const db = createClient();
  return db
    .from("sessions")
    .update({ ended_at: new Date(at).toISOString() })
    .is("ended_at", null);
}
