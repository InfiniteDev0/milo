"use client";

/* Notes, against the database.
 *
 * Every function here is a thin wrapper over one Supabase call. There is no
 * user_id anywhere: RLS puts `auth.uid() = user_id` on every row, so a query
 * that forgot it would return nothing rather than someone else's notes. The id
 * is set on insert because the policy's WITH CHECK requires it to match.
 *
 * Shape note: the app works in camelCase, the database in snake_case. The
 * mapping lives here and nowhere else — a component that knows about
 * `updated_at` is a component that will break when a column is renamed.
 */

import { createClient } from "@/lib/supabase/client";

const fromRow = (r) => ({
  id: r.id,
  title: r.title,
  body: r.body,
  category: r.category,
  starred: r.starred,
  date: r.created_at,
});

/* The editor stores HTML. Search over raw HTML matches tag names and misses
   any word that happens to straddle a tag boundary, so a plain copy is kept
   alongside it — written here, never typed by anyone. */
export function toPlain(html) {
  if (!html) return "";
  if (typeof window === "undefined") return html.replace(/<[^>]*>/g, " ");
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

export async function listNotes() {
  const db = createClient();
  const { data, error } = await db
    .from("notes")
    .select("id, title, body, category, starred, created_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data.map(fromRow);
}

export async function createNote(userId, note) {
  const db = createClient();
  const { data, error } = await db
    .from("notes")
    .insert({
      id: note.id,
      user_id: userId,
      title: note.title ?? "",
      body: note.body ?? "",
      plain: toPlain(note.body),
      category: note.category ?? "ideas",
      starred: note.starred ?? false,
    })
    .select("id, title, body, category, starred, created_at")
    .single();

  if (error) throw error;
  return fromRow(data);
}

/* Returns the promise rather than awaiting, so the caller can hand it to the
   write queue and carry on. */
export function saveNote(note) {
  const db = createClient();
  return db
    .from("notes")
    .update({
      title: note.title,
      body: note.body,
      plain: toPlain(note.body),
      category: note.category,
      starred: note.starred,
    })
    .eq("id", note.id);
}

export function deleteNote(id) {
  const db = createClient();
  return db.from("notes").delete().eq("id", id);
}
