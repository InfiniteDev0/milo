"use client";

/* Side cannons, fired once when a day closes.
 *
 * Three seconds and gone — long enough to notice, short enough that it never
 * becomes something you sit through. It fires in the colours of the blocks you
 * actually did, so the day throws its own colours back at you rather than a
 * generic party palette.
 *
 * This is the one moment in Milo that gets loud, and it only ever fires for
 * something that happened. There is no counterpart for a day that ended early.
 */

import confetti from "canvas-confetti";

const FALLBACK = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

export function sideCannons(colors) {
  const end = Date.now() + 3 * 1000; // 3 seconds
  const palette = colors?.length ? colors : FALLBACK;

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors: palette,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors: palette,
    });

    requestAnimationFrame(frame);
  };

  frame();
}
