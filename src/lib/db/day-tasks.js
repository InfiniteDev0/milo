"use client";

// The Tasks view's day tasks, against the database (migration 0014). One thin wrapper per call.
// `day` is the column a task sits in, never a due date — see the migration.
// The view keys a day by toDateString(); the database stores a plain date. The mapping lives here only.

import { createClient } from "@/lib/supabase/client";
import { createRowQueue } from "./row-queue";
import { liveFilter, trashOrDelete } from "./trash";

const BASE = "id, day, title, done, position, minutes, actual_ms, started_at, note, steps, repeat, done_on";
// newer columns, newest first: category_id (the label) with 0016, repeat_rule and at_time with 0020.
// Until one is applied, the tasks load without it (and without anything newer)
const TRIES = [`${BASE}, category_id, repeat_rule, at_time`, `${BASE}, category_id`, BASE];

const pad = (n) => String(n).padStart(2, "0");

// "Thu Nov 05 2026" → "2026-11-05", in the browser's own time zone
export const dateOfKey = (key) => {
  const d = new Date(key);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
// "2026-11-05" → "Thu Nov 05 2026" (built from parts: parsing the string would read it as UTC)
export const keyOfDate = (date) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toDateString();
};

const fromRow = (r) => ({
  id: r.id,
  title: r.title,
  done: r.done,
  minutes: r.minutes ?? null,
  actualMs: Number(r.actual_ms ?? 0),
  startedAt: r.started_at ? Date.parse(r.started_at) : null,
  note: r.note ?? "",
  steps: r.steps ?? [],
  repeat: r.repeat ?? "none",
  doneOn: r.done_on ?? {},
  // its label: a category or subcategory. undefined before 0016, so saves don't send the column
  categoryId: "category_id" in r ? (r.category_id ?? null) : undefined,
  // a custom repeat's rule, and a time of day; undefined before 0020
  repeatRule: "repeat_rule" in r ? (r.repeat_rule ?? null) : undefined,
  atTime: "at_time" in r ? (r.at_time ?? null) : undefined,
});

// whether the database has labels yet (0016), and custom repeats and times (0020), learned by the last listDayTasks()
let labels = false;
let extras = false;
export const dayTaskLabels = () => labels;
export const dayTaskExtras = () => extras;

// every day task, grouped by the day it sits in and in its order there: { [dayKey]: task[] }
export async function listDayTasks() {
  // nothing in Trash (0019)
  const only = await liveFilter();
  const read = (columns) => only(createClient().from("day_tasks").select(columns).order("day", { ascending: true }).order("position", { ascending: true }));
  let data, error;
  // 42703: no such column — 0016 isn't applied yet, so read them without the label
  for (const columns of TRIES) {
    ({ data, error } = await read(columns));
    if (error?.code !== "42703") {
      labels = columns.includes("category_id");
      extras = columns.includes("repeat_rule");
      break;
    }
  }
  if (error) throw error;
  const byDay = {};
  for (const r of data) (byDay[keyOfDate(r.day)] ??= []).push(fromRow(r));
  return byDay;
}

// the whole task, where it sits and its place there — create, edit and move are one upsert
function saveDayTask(userId, task, key, position) {
  return createClient().from("day_tasks").upsert({
    id: task.id,
    user_id: userId,
    day: dateOfKey(key),
    title: task.title ?? "",
    done: Boolean(task.done),
    position,
    minutes: task.minutes ?? null,
    actual_ms: Math.max(0, Math.round(task.actualMs ?? 0)),
    started_at: task.startedAt ? new Date(task.startedAt).toISOString() : null,
    note: task.note ?? "",
    steps: task.steps ?? [],
    repeat: task.repeat ?? "none",
    done_on: task.doneOn ?? {},
    ...(task.categoryId !== undefined && { category_id: task.categoryId }),
    ...(task.repeatRule !== undefined && { repeat_rule: task.repeatRule }),
    ...(task.atTime !== undefined && { at_time: task.atTime }),
  });
}

function deleteDayTask(id) {
  return createClient().from("day_tasks").delete().eq("id", id);
}

// the queue's own delete is for good: a task that left the day for a block was moved, not deleted
export const dayTaskQueue = createRowQueue("day task", saveDayTask, deleteDayTask);

// deleted on purpose (after Undo): into Trash
export const trashDayTask = (id) => trashOrDelete("day_tasks", id);
