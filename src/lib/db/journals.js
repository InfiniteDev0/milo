"use client";

// Journals and their pages, against the database. One thin wrapper per Supabase call.
// No user_id in reads: RLS puts auth.uid() = user_id on every row.

import { createClient } from "@/lib/supabase/client";

const JOURNAL_COLUMNS = "id, title, cover, created_at";
const PAGE_COLUMNS =
  "id, journal_id, position, kind, stamp, entry, heads, body, data, notes, blocks, bookmarked, created_at, updated_at";

const journalFromRow = (r) => ({
  id: r.id,
  title: r.title,
  cover: r.cover,
  createdAt: Date.parse(r.created_at),
});

const pageFromRow = (r) => ({
  id: r.id,
  journalId: r.journal_id,
  position: r.position,
  kind: r.kind,
  stamp: r.stamp ?? null,
  entry: r.entry ?? null,
  heads: r.heads,
  body: r.body,
  data: r.data ?? {},
  notes: r.notes ?? [],
  blocks: r.blocks ?? [],
  bookmarked: r.bookmarked,
  createdAt: Date.parse(r.created_at),
  updatedAt: Date.parse(r.updated_at),
});

export async function listJournals() {
  const { data, error } = await createClient()
    .from("journals")
    .select(JOURNAL_COLUMNS)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(journalFromRow);
}

export function saveJournal(userId, journal) {
  return createClient().from("journals").upsert({
    id: journal.id,
    user_id: userId,
    title: journal.title,
    cover: journal.cover,
    updated_at: new Date().toISOString(),
  });
}

export async function listPages(journalId) {
  const { data, error } = await createClient()
    .from("journal_pages")
    .select(PAGE_COLUMNS)
    .eq("journal_id", journalId)
    .order("position", { ascending: true });
  if (error) throw error;
  return data.map(pageFromRow);
}

export function savePage(userId, page) {
  return createClient().from("journal_pages").upsert({
    id: page.id,
    user_id: userId,
    journal_id: page.journalId,
    position: page.position,
    kind: page.kind,
    stamp: page.stamp,
    entry: page.entry,
    heads: page.heads,
    body: page.body ?? "",
    data: page.data ?? {},
    notes: page.notes ?? [],
    blocks: page.blocks ?? [],
    bookmarked: page.bookmarked ?? false,
    created_at: new Date(page.createdAt).toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export function deletePage(id) {
  return createClient().from("journal_pages").delete().eq("id", id);
}

// voice notes load per page, never with the book: they are the heavy part
export async function listVoice(pageIds) {
  if (pageIds.length === 0) return [];
  const { data, error } = await createClient()
    .from("journal_voice")
    .select("id, page_id, audio, seconds, created_at")
    .in("page_id", pageIds)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map((r) => ({ id: r.id, pageId: r.page_id, audio: r.audio, seconds: r.seconds }));
}

export async function addVoice(userId, voice) {
  const { error } = await createClient().from("journal_voice").insert({
    id: voice.id,
    user_id: userId,
    page_id: voice.pageId,
    audio: voice.audio,
    seconds: voice.seconds,
  });
  if (error) throw error;
}

export async function deleteVoice(id) {
  const { error } = await createClient().from("journal_voice").delete().eq("id", id);
  if (error) throw error;
}
