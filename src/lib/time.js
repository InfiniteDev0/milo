"use client";

/* Reading a clock that's running.
 *
 * See ../../TIME.md. Two rules show up here rather than in the provider,
 * because they are about how time is *read*, not how it's stored:
 *
 *   - only ever count up. No remaining, no target, no bar filling toward a
 *     number. A countdown is a deadline and Milo has none.
 *   - no seconds. Seconds create urgency, and this display is meant to make
 *     time visible, not to hurry anyone through it.
 */

import { useEffect, useState } from "react";

/* Ticks so a running total moves. Every 20 seconds by default — the display is
   in minutes, so a per-second render would be 20x the work for the same
   picture. Components that want a smoother clock ask for one. */
export function useNow(active = true, everyMs = 20000) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(t);
  }, [active, everyMs]);

  return now;
}

/* "1h 05m" / "24m". Never "0m" — a block with no time recorded reads as a block
   that wasn't scheduled, exactly as a skipped habit does. Callers get null and
   render nothing. */
export function spent(ms) {
  if (!ms || ms < 60000) return null;

  const total = Math.floor(ms / 60000);
  const h = Math.floor(total / 60);
  const m = total % 60;

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

// the same figure said as a sentence, for the places that read as prose
export function spentLong(ms) {
  const short = spent(ms);
  if (!short) return null;
  return short.replace("h", " hours").replace("m", " minutes");
}
