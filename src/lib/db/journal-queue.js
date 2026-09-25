"use client";

// Saves journals and pages the way notes are saved: one request per row at a time, every retry sends the newest version,
// and a deleted page refuses later saves so one still on the wire can't bring it back.

import { deletePage, saveJournal, savePage } from "./journals";

const BACKOFF = [1000, 3000, 8000, 20000];

// "page:<id>" or "journal:<id>" -> the newest version, and where its save has got to
const rows = new Map();

const entry = (key) => {
  if (!rows.has(key)) rows.set(key, { latest: null, userId: null, timer: null, inflight: false, attempts: 0, gone: false });
  return rows.get(key);
};

const send = (key, e, value) => {
  const [kind, id] = key.split(":");
  if (e.gone) return deletePage(id);
  return kind === "page" ? savePage(e.userId, value) : saveJournal(e.userId, value);
};

async function flush(key) {
  const e = entry(key);
  if (e.inflight) return;
  const deleting = e.gone;
  const sent = e.latest;
  if (!deleting && !sent) return;

  e.inflight = true;
  try {
    const { error } = (await send(key, e, sent)) ?? {};
    if (error) throw error;
    e.attempts = 0;
    e.inflight = false;
    if (!deleting && (e.gone || e.latest !== sent)) flush(key);
  } catch (err) {
    e.inflight = false;
    const delay = BACKOFF[Math.min(e.attempts, BACKOFF.length - 1)];
    e.attempts += 1;
    console.warn(`[milo] journal ${deleting ? "delete" : "save"} failed (${key}), retrying in ${delay}ms`, err);
    clearTimeout(e.timer);
    e.timer = setTimeout(() => {
      e.timer = null;
      flush(key);
    }, delay);
  }
}

const later = (key, userId, value, wait) => {
  const e = entry(key);
  if (e.gone) return;
  e.latest = value;
  e.userId = userId;
  clearTimeout(e.timer);
  e.timer = setTimeout(() => {
    e.timer = null;
    flush(key);
  }, wait);
};

// typing waits a beat, so a burst of keystrokes is one save
export const savePageSoon = (userId, page, wait = 700) => later(`page:${page.id}`, userId, page, wait);
export const saveJournalSoon = (userId, journal, wait = 0) => later(`journal:${journal.id}`, userId, journal, wait);

export function deletePageForGood(id) {
  const e = entry(`page:${id}`);
  e.gone = true;
  e.latest = null;
  clearTimeout(e.timer);
  e.timer = null;
  flush(`page:${id}`);
}
