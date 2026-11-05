"use client";

/* A save line for one kind of row, the way note-queue.js saves notes: one request
   per row at a time, every save (retries included) sends the newest version, and
   a delete goes through the same line, so a save still on the wire can't bring a
   deleted row back. Silent, like sync.js: a late write is retried, never announced.

     const queue = createRowQueue("category", saveCategory, deleteCategory);
     queue.save(id, args, wait)   args are passed to save(...args) when it goes out
     queue.remove(id)             the real delete, after any Undo window */

const BACKOFF = [1000, 3000, 8000, 20000];

export function createRowQueue(label, save, remove) {
  // id -> the newest version, and where its save has got to
  const rows = new Map();

  const entry = (id) => {
    if (!rows.has(id)) rows.set(id, { latest: null, timer: null, inflight: false, attempts: 0, gone: false });
    return rows.get(id);
  };

  async function flush(id) {
    const e = entry(id);
    // one on the wire already: when it settles it sends whatever is newest
    if (e.inflight) return;
    const deleting = e.gone;
    const sent = e.latest;
    if (!deleting && !sent) return;

    e.inflight = true;
    try {
      const { error } = (await (deleting ? remove(id) : save(...sent))) ?? {};
      if (error) throw error;
      e.attempts = 0;
      e.inflight = false;
      // a delete or newer edits arrived while that was on the wire — send them too
      if (!deleting && (e.gone || e.latest !== sent)) flush(id);
    } catch (err) {
      e.inflight = false;
      const delay = BACKOFF[Math.min(e.attempts, BACKOFF.length - 1)];
      e.attempts += 1;
      console.warn(`[milo] ${label} ${deleting ? "delete" : "save"} failed (${id}), retrying in ${delay}ms`, err);
      clearTimeout(e.timer);
      e.timer = setTimeout(() => {
        e.timer = null;
        flush(id);
      }, delay);
    }
  }

  return {
    // wait 0 saves now; typing waits a beat, so a burst of keystrokes is one save
    save(id, args, wait = 800) {
      const e = entry(id);
      // deleted for good: nothing may write it again
      if (e.gone) return;
      e.latest = args;
      clearTimeout(e.timer);
      e.timer = setTimeout(() => {
        e.timer = null;
        flush(id);
      }, wait);
    },
    remove(id) {
      const e = entry(id);
      e.gone = true;
      e.latest = null;
      clearTimeout(e.timer);
      e.timer = null;
      flush(id);
    },
  };
}
