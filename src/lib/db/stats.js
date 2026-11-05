"use client";

// The two counts in the account menu, read from what's already saved — nothing invented.
//   done   tasks ticked done this week (Monday to Sunday): block tasks, from each day's
//          task_state, and the Tasks view's day tasks, a repeat's copies counted per day ticked
//   notes  every note you've written
// RLS keeps every read to your own rows.

import { createClient } from "@/lib/supabase/client";
import { stampOf } from "@/lib/stamp";
import { dateOfKey } from "./day-tasks";
import { liveFilter } from "./trash";

export async function readStats() {
  const db = createClient();
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
  const first = dateOfKey(week[0].toDateString());
  const last = dateOfKey(week[6].toDateString());

  const only = await liveFilter();
  const [days, dayTasks, notes] = await Promise.all([
    db.from("days").select("task_state").in("stamp", week.map(stampOf)),
    // done ones, and any repeat (its ticks live in done_on, whatever day it started)
    only(db.from("day_tasks").select("day, done, repeat, done_on").or("done.eq.true,repeat.neq.none")),
    db.from("notes").select("id", { count: "exact", head: true }),
  ]);
  const failed = [days, dayTasks, notes].find((r) => r.error);
  if (failed) throw failed.error;

  const blockDone = days.data.reduce((n, d) => n + Object.values(d.task_state ?? {}).filter((s) => s === "done").length, 0);
  const inWeek = (date) => date >= first && date <= last;
  const dayDone = dayTasks.data.reduce((n, t) => {
    const own = t.done && inWeek(t.day) ? 1 : 0;
    const copies = Object.entries(t.done_on ?? {}).filter(([key, on]) => on && inWeek(dateOfKey(key))).length;
    return n + own + copies;
  }, 0);

  return { done: blockDone + dayDone, notes: notes.count ?? 0 };
}
