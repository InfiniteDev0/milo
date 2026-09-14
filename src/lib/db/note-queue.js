"use client";

// Saves notes so the newest version always wins: one request per note at a time,
// and every save — retries included — sends the latest text, never the version that failed.

import { saveNote } from "./notes";

const BACKOFF = [1000, 3000, 8000, 20000];

// note id -> the newest version, and where its save has got to
const notes = new Map();

const entry = (id) => {
  if (!notes.has(id)) notes.set(id, { latest: null, userId: null, timer: null, inflight: false, attempts: 0 });
  return notes.get(id);
};

async function flush(id) {
  const e = entry(id);
  // one on the wire already: when it settles it sends whatever is newest
  if (e.inflight || !e.latest) return;
  e.inflight = true;
  const sent = e.latest;
  try {
    const { error } = (await saveNote(e.userId, sent)) ?? {};
    if (error) throw error;
    e.attempts = 0;
    e.inflight = false;
    // edits arrived while that was saving — send them too
    if (e.latest !== sent) flush(id);
  } catch (err) {
    e.inflight = false;
    const delay = BACKOFF[Math.min(e.attempts, BACKOFF.length - 1)];
    e.attempts += 1;
    console.warn(`[milo] note save failed (${id}), retrying in ${delay}ms`, err);
    clearTimeout(e.timer);
    e.timer = setTimeout(() => {
      e.timer = null;
      flush(id);
    }, delay);
  }
}

// wait 0 saves now; typing waits a beat, so a burst of keystrokes is one save
export function saveNoteSoon(userId, note, wait = 800) {
  const e = entry(note.id);
  e.latest = note;
  e.userId = userId;
  clearTimeout(e.timer);
  e.timer = setTimeout(() => {
    e.timer = null;
    flush(note.id);
  }, wait);
}
