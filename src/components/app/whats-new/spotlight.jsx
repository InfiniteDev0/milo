"use client";

/* The What's new spotlight: once started, the whole screen goes soft and out
   of focus except the one place the current step happens — the Tasks toggle,
   today's column, the search, the categories — ringed in green. Clicks outside
   it are held, so the step gets done; menus, dialogs and toasts it opens sit
   above the blur and work as usual.

   The place is found by its data-tour name (steps.js lists them in order of
   preference, so a step on another page points at the way there first), and
   followed as the page scrolls or resizes. If none of them is on screen, there
   is no blur at all — nobody can be stuck behind it. */

import { useEffect, useState } from "react";

const PAD = 8;

// the first of the step's places that is on screen, as a padded rectangle
function find(targets) {
  for (const name of targets) {
    for (const el of document.querySelectorAll(`[data-tour="${name}"]`)) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth) {
        return {
          top: Math.max(0, r.top - PAD),
          left: Math.max(0, r.left - PAD),
          bottom: Math.min(window.innerHeight, r.bottom + PAD),
          right: Math.min(window.innerWidth, r.right + PAD),
        };
      }
    }
  }
  return null;
}

const same = (a, b) => a === b || (a && b && a.top === b.top && a.left === b.left && a.bottom === b.bottom && a.right === b.right);

const PANEL = "fixed z-[35] bg-black/25 backdrop-blur-[5px] transition-[top,left,width,height] duration-200";

export function Spotlight({ targets }) {
  const [hole, setHole] = useState(null);

  // followed a few times a second: cheap, and catches scrolling, resizing and pages changing
  useEffect(() => {
    const look = () => setHole((now) => {
      const next = find(targets);
      return same(now, next) ? now : next;
    });
    look();
    const t = setInterval(look, 200);
    window.addEventListener("resize", look);
    return () => {
      clearInterval(t);
      window.removeEventListener("resize", look);
    };
  }, [targets]);

  if (!hole) return null;
  const { top, left, bottom, right } = hole;

  return (
    <>
      {/* four panes around the clear place */}
      <div className={PANEL} style={{ top: 0, left: 0, right: 0, height: top }} />
      <div className={PANEL} style={{ top: bottom, left: 0, right: 0, bottom: 0 }} />
      <div className={PANEL} style={{ top, left: 0, width: left, height: bottom - top }} />
      <div className={PANEL} style={{ top, left: right, right: 0, height: bottom - top }} />
      {/* the green ring round it */}
      <div
        aria-hidden
        className="pointer-events-none fixed z-[36] rounded-xl ring-2 ring-[#00b86b] transition-[top,left,width,height] duration-200"
        style={{ top, left, width: right - left, height: bottom - top }}
      />
    </>
  );
}
