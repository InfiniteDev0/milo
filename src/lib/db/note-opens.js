"use client";

// When you last opened each note (note_opens, migration 0015), for the Recent tab.
// Its own table, so opening a note never counts as editing it.

import { createClient } from "@/lib/supabase/client";
import { queueWrite } from "./sync";

// note id -> when it was last opened, for the notes opened since midnight
export async function listOpenedToday() {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const { data, error } = await createClient()
    .from("note_opens")
    .select("note_id, opened_at")
    .gte("opened_at", midnight.toISOString());
  if (error) throw error;
  return Object.fromEntries(data.map((r) => [r.note_id, Date.parse(r.opened_at)]));
}

// one row per note, so a new open just moves the time on. Opening the same note again
// within a moment is one write
export function saveOpen(userId, noteId, at) {
  queueWrite(`open:${noteId}`, () =>
    createClient()
      .from("note_opens")
      .upsert({ note_id: noteId, user_id: userId, opened_at: new Date(at).toISOString() }),
  );
}
