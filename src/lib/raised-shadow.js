"use client";

// A card that lifts off the page while you drag it. See Motion's reorder example.

import { useEffect } from "react";
import { animate, useMotionValue } from "motion/react";

const RAISED = "0px 10px 24px rgba(0, 0, 0, 0.18)";
const SPRING = { type: "spring", stiffness: 400, damping: 30 };

export function useRaisedShadow(y, resting) {
  const boxShadow = useMotionValue(resting);

  // y is non-zero exactly while the item is displaced, so no dragging flag is needed.
  useEffect(() => {
    let active = false;
    // `on` returns its own unsubscribe — dropping it leaks a listener per row per mount.
    return y.on("change", (latest) => {
      const wasActive = active;
      active = latest !== 0;
      if (active !== wasActive) animate(boxShadow, active ? RAISED : resting, SPRING);
    });
  }, [y, boxShadow, resting]);

  // Resting can change while sitting still — a row gets highlighted, say.
  useEffect(() => {
    if (y.get() === 0) animate(boxShadow, resting, SPRING);
  }, [resting, boxShadow, y]);

  return boxShadow;
}
