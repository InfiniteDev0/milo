"use client";

/* The moving pointer: an arrow cursor that glides in to the exact thing the
   current step needs pressed (the 0:00 on a task, Add a task, the search…),
   taps it with a ripple, rests, and goes again — until the step is done. It
   sits above the blur and never takes a click itself. Followed as the page
   scrolls; with nothing to point at, it isn't drawn. */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { find } from "./spotlight";

// where it aims: the middle of the first of these on screen
const centreOf = (targets) => {
  const r = find(targets);
  return r ? { x: Math.round((r.left + r.right) / 2), y: Math.round((r.top + r.bottom) / 2) } : null;
};

const LOOP = { duration: 2, repeat: Infinity, repeatDelay: 0.4, ease: "easeInOut" };
// the glide in from below-right, the press, the let go, the drift back out
const TIMES = [0, 0.45, 0.58, 0.7, 1];

export function Pointer({ targets }) {
  const [at, setAt] = useState(null);
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    const look = () =>
      setAt((now) => {
        const next = centreOf(targets);
        return now && next && now.x === next.x && now.y === next.y ? now : next;
      });
    look();
    const t = setInterval(look, 200);
    window.addEventListener("resize", look);
    return () => {
      clearInterval(t);
      window.removeEventListener("resize", look);
    };
  }, [targets]);

  if (!at) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed z-[46]" style={{ left: at.x, top: at.y }}>
      {/* the ripple where it presses */}
      {!reduce && (
        <motion.span
          className="absolute -top-5 -left-5 size-10 rounded-full border-2 border-[#ff8a00]"
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: [0.3, 0.3, 0.3, 1.4, 1.4], opacity: [0, 0, 0.8, 0, 0] }}
          transition={{ ...LOOP, times: TIMES }}
        />
      )}
      {/* the arrow, its tip on the spot */}
      <motion.svg
        viewBox="0 0 24 24"
        className="absolute top-0 left-0 size-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
        initial={false}
        animate={reduce ? { x: 0, y: 0 } : { x: [46, 0, 0, 0, 46], y: [46, 0, 0, 0, 46], scale: [1, 1, 0.82, 1, 1], opacity: [0, 1, 1, 1, 0] }}
        transition={reduce ? { duration: 0 } : { ...LOOP, times: TIMES }}
      >
        <path d="M3 2.5 L20 11 L12.5 12.8 L9.2 20.5 Z" fill="#ff8a00" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
      </motion.svg>
    </div>
  );
}
