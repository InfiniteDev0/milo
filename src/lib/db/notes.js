"use client";

// Notes, against the database. One thin wrapper per Supabase call.
// No user_id in reads: RLS puts auth.uid() = user_id on every row.
// The app speaks camelCase, the database snake_case — the mapping lives here only.

import { createClient } from "@/lib/supabase/client";

const COLUMNS = "id, title, body, plain, colour, starred, block_id, created_at, updated_at";

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

// Every note, newest first. Pinned-first is a view decision, made where it's shown.
export async function listNotes() {
  const db = createClient();
  const { data, error } = await db
    .from("notes")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

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
  });
}

export function deleteNote(id) {
  const db = createClient();
  return db.from("notes").delete().eq("id", id);
}
