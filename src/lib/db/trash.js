"use client";

/* Trash, across everything you can delete (migration 0019; notes since 0015).

   hasTrash() answers once whether the database has the deleted_at columns yet.
   Before 0019 every read and delete behaves exactly as it always did — reads
   don't filter, deletes are for good — so nothing breaks while it waits.

   listTrash() gathers what's in Trash for the Trash page; restore and
   deleteForGood act on one item by its kind. */

import { createClient } from "@/lib/supabase/client";

// only a yes is remembered: a no is asked again next time, so running 0019 while Milo is open counts at
// once (remembering the no meant a delete straight after the migration still went for good)
let known = false;
export async function hasTrash() {
  if (known) return true;
  // 42703 is "no such column": 0019 not run. Any other answer means it's there (or the read failed, and so will the rest)
  const { error } = await createClient().from("tasks").select("deleted_at").limit(1);
  known = error?.code !== "42703";
  return known;
}

// a filter that leaves Trash out, once there is one. It hands back a function, never a query: a
// query is thenable, so returning one from an async function would run it there and then
export async function liveFilter() {
  return (await hasTrash()) ? (q) => q.is("deleted_at", null) : (q) => q;
}

// into Trash if there is one; otherwise gone for good, as before
export async function trashOrDelete(table, id) {
  const db = createClient();
  if (await hasTrash()) return db.from(table).update({ deleted_at: new Date().toISOString() }).eq("id", id);
  return db.from(table).delete().eq("id", id);
}

const TABLES = { task: "tasks", dayTask: "day_tasks", block: "blocks", page: "journal_pages" };

// everything in Trash, newest first, with what each needs to be recognised
export async function listTrash() {
  const db = createClient();
  const inTrash = (table, columns) => db.from(table).select(columns).not("deleted_at", "is", null).order("deleted_at", { ascending: false });
  const [tasks, dayTasks, blocks, pages, journals] = await Promise.all([
    inTrash("tasks", "id, name, block_id, deleted_at, blocks(name, bg, ink)"),
    inTrash("day_tasks", "id, title, day, deleted_at"),
    inTrash("blocks", "id, name, bg, ink, deleted_at"),
    inTrash("journal_pages", "id, journal_id, kind, stamp, entry, deleted_at"),
    db.from("journals").select("id, title"),
  ]);
  const failed = [tasks, dayTasks, blocks, pages, journals].find((r) => r.error);
  if (failed) throw failed.error;
  const journalOf = new Map(journals.data.map((j) => [j.id, j.title]));
  const at = (r) => Date.parse(r.deleted_at);
  return {
    tasks: tasks.data.map((r) => ({ kind: "task", id: r.id, title: r.name, block: r.blocks, deletedAt: at(r) })),
    dayTasks: dayTasks.data.map((r) => ({ kind: "dayTask", id: r.id, title: r.title, day: r.day, deletedAt: at(r) })),
    blocks: blocks.data.map((r) => ({ kind: "block", id: r.id, title: r.name, bg: r.bg, ink: r.ink, deletedAt: at(r) })),
    pages: pages.data.map((r) => ({ kind: "page", id: r.id, page: r, journal: journalOf.get(r.journal_id) ?? "Journal", deletedAt: at(r) })),
  };
}

export function restore(kind, id) {
  return createClient().from(TABLES[kind]).update({ deleted_at: null }).eq("id", id);
}

// for good: a block takes its tasks with it (on delete cascade)
export function deleteForGood(kind, id) {
  return createClient().from(TABLES[kind]).delete().eq("id", id);
}
