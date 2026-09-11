"use client";

/* The write side of the app.
 *
 * Every mutation in Milo is optimistic: state changes in memory, the UI paints,
 * and the network catches up. Ticking a task, dragging a block, the running
 * clock — these fire constantly, and an interface that waits on a round-trip
 * for any of them feels broken in a way no amount of spinner design fixes.
 *
 * So this is the thing that catches up. It:
 *
 *   - coalesces rapid edits to the same row (typing a note is one write, not
 *     forty)
 *   - retries with a backoff, because a dropped connection is normal
 *   - stays silent. A red banner because a write is three seconds late is the
 *     exact anxiety this app exists to remove — the queue survives, the cache
 *     already holds the truth, and the user finds out about nothing.
 *
 * What it deliberately does NOT do is resolve conflicts. Milo is one person on
 * one account; last write wins is correct here and anything cleverer would be
 * machinery for a problem nobody has.
 */

const pending = new Map(); // key -> { timer, run }
const failed = new Map(); // key -> attempts

const BACKOFF = [1000, 3000, 8000, 20000];

/* Queue a write. Calls with the same key replace each other, so the last state
   wins and the intermediate ones never leave the machine. */
export function queueWrite(key, run, { wait = 800 } = {}) {
  const existing = pending.get(key);
  if (existing) clearTimeout(existing.timer);

  const timer = setTimeout(() => {
    pending.delete(key);
    attempt(key, run);
  }, wait);

  pending.set(key, { timer, run });
}

/* For the things you would notice losing — a completed task, a finished block.
   Same queue, no wait. */
export function writeNow(key, run) {
  const existing = pending.get(key);
  if (existing) clearTimeout(existing.timer);
  pending.delete(key);
  return attempt(key, run);
}

async function attempt(key, run) {
  try {
    const { error } = (await run()) ?? {};
    if (error) throw error;
    failed.delete(key);
  } catch (err) {
    const attempts = (failed.get(key) ?? 0) + 1;
    failed.set(key, attempts);

    const delay = BACKOFF[Math.min(attempts - 1, BACKOFF.length - 1)];
    // eslint-disable-next-line no-console
    console.warn(`[milo] write failed (${key}), retrying in ${delay}ms`, err);
    setTimeout(() => attempt(key, run), delay);
  }
}

/* Nothing calls this yet. It exists so that when there IS something worth
   telling the user — "your last hour hasn't saved" rather than "a request
   failed" — the number is already here. */
export const stuckWrites = () => failed.size;

/* Anything still queued gets one last shot as the page goes away. It cannot
   await — which is fine, the request goes out and the browser lets it finish.

   THREE events, not one. `beforeunload` alone was wrong: it is the least
   reliable of them on a phone, where a backgrounded tab is often discarded
   with no unload at all. `visibilitychange` → hidden is the last event that
   fires dependably there, and `pagehide` covers the back/forward cache.

   This matters most for the pause. Pausing the day means you are leaving
   RIGHT NOW — closing the lid, switching apps — which is precisely the
   moment a debounced write has not landed yet. Losing that one write loses
   the block, the task and the note you just left yourself, which is the
   whole feature. */
function flush() {
  pending.forEach(({ timer, run }, key) => {
    clearTimeout(timer);
    attempt(key, run);
  });
  pending.clear();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flush);
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}
