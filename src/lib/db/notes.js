"use client";

// Notes, against the database. One thin wrapper per Supabase call.
// No user_id in reads: RLS puts auth.uid() = user_id on every row.
// The app speaks camelCase, the database snake_case — the mapping lives here only.

import { createClient } from "@/lib/supabase/client";

const BASE = "id, title, body, plain, colour, starred, block_id, task_id, show_on, created_at, updated_at";
// newer columns, newest first: category_id comes with migration 0014, deleted_at and cover with 0015.
// Until one is applied, notes still load without it (and without anything newer)
const TRIES = [`${BASE}, category_id, deleted_at, cover`, `${BASE}, category_id`, BASE];

const fromRow = (r) => ({
  id: r.id,
  title: r.title,
  body: r.body,
  // the stripped text, for search and the card preview
  text: r.plain,
  colour: r.colour ?? "plain",
  // `starred` in the database, a pin in the app
  pinned: r.starred,
  blockId: r.block_id ?? null,
  // the task it was written about, if any
  taskId: r.task_id ?? null,
  // the day it waits for, when it was left for one
  showOn: r.show_on ?? null,
  // the category or subcategory it sits in. undefined (not null) when 0014 isn't applied yet,
  // which keeps saves from sending a column the database doesn't have
  categoryId: "category_id" in r ? (r.category_id ?? null) : undefined,
  // when it went to Trash; null when it's not there, undefined before 0015 (deletes are then for good)
  // the picture across the top of its card; undefined before 0015
  cover: "cover" in r ? (r.cover ?? null) : undefined,
  deletedAt: "deleted_at" in r ? (r.deleted_at ? Date.parse(r.deleted_at) : null) : undefined,
  createdAt: Date.parse(r.created_at),
  updatedAt: Date.parse(r.updated_at),
});

// The editor stores HTML; search over HTML would match tag names, so a plain copy is kept too.
export function toPlain(html) {
  if (!html) return "";
  if (typeof window === "undefined") return html.replace(/<[^>]*>/g, " ");
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

// which of the newer columns the database has, learned by the last listNotes()
let support = { category: false, trash: false };
export const notesSupport = () => support;

// Every note, newest first — Trash included (deletedAt says which). Pinned-first is a view decision.
export async function listNotes() {
  const db = createClient();
  const read = (columns) => db.from("notes").select(columns).order("created_at", { ascending: false });
  let data, error;
  // 42703: no such column — that migration isn't applied yet, so try the columns from before it
  for (const columns of TRIES) {
    ({ data, error } = await read(columns));
    if (error?.code !== "42703") {
      support = { category: columns.includes("category_id"), trash: columns.includes("deleted_at") };
      break;
    }
  }

  if (error) throw error;
  return data.map(fromRow);
}

// Create and every edit are the same upsert of the whole note, so an edit can't be lost
// if the first save hadn't landed yet. Returns the promise for the write queue.
export function saveNote(userId, note) {
  const db = createClient();
  return db.from("notes").upsert({
    id: note.id,
    user_id: userId,
    title: note.title ?? "",
    body: note.body ?? "",
    plain: toPlain(note.body),
    colour: note.colour ?? "plain",
    starred: note.pinned ?? false,
    block_id: note.blockId ?? null,
    task_id: note.taskId ?? null,
    show_on: note.showOn ?? null,
    // only once the column exists (see fromRow)
    ...(note.categoryId !== undefined && { category_id: note.categoryId }),
    ...(note.cover !== undefined && { cover: note.cover }),
    ...(note.deletedAt !== undefined && { deleted_at: note.deletedAt ? new Date(note.deletedAt).toISOString() : null }),
  });
}

export function deleteNote(id) {
  const db = createClient();
  return db.from("notes").delete().eq("id", id);
}
