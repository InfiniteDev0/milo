"use client";

// A hand-drawn line that draws itself across done text, and un-draws when it's undone.
// Lifted from animate-ui's playful todolist — its path, timing and colour, none of its checkbox.

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const PATH =
  "M 10 16.91 s 79.8 -11.36 98.1 -11.34 c 22.2 0.02 -47.82 14.25 -33.39 22.02 c 12.61 6.77 124.18 -27.98 133.31 -17.28 c 7.52 8.38 -26.8 20.02 4.61 22.05 c 24.55 1.93 113.37 -20.36 113.37 -20.36";

// the last done-state each item was seen in, so a card that just changed columns still draws
const seen = new Map();

// draws over a second; appears at once when struck, vanishes only after the un-draw
const transition = (done) => ({
  pathLength: { duration: 1, ease: "easeInOut" },
  opacity: { duration: 0.01, delay: done ? 0 : 1 },
});

export function Strike({ id, done, children, className = "" }) {
  // decided once, on mount: draw in only if this item was last seen not done
  const [fresh] = useState(() => id != null && done && seen.get(id) === false);

  useEffect(() => {
    if (id != null) seen.set(id, done);
  }, [id, done]);

  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <motion.svg
        aria-hidden
        viewBox="0 0 340 32"
        // keeps the drawing's proportions, as the original does — stretching it made a zigzag
        className="pointer-events-none absolute left-0 top-1/2 h-[2.2em] w-full -translate-y-1/2 overflow-visible"
      >
        <motion.path
          d={PATH}
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeMiterlimit={10}
          // the line stays 2px however far the svg scales
          vectorEffect="non-scaling-stroke"
          // loads already done arrive struck; a card that just moved here draws itself in
          initial={fresh ? { pathLength: 0, opacity: 1 } : false}
          animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
          transition={transition(done)}
          // the text's own colour, like the original — a darker line buried the word
          className="stroke-current"
        />
      </motion.svg>
    </span>
  );
}
