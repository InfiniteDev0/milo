"use client";

/* A sideways scrollbar whose pill stays long, however many days there are. The
   browser's own pill shrinks as the row grows — a year of days made it a stub —
   so the row hides its own and this one drives it instead. Drag the pill, or
   press the track to jump there. */

import { useEffect, useRef, useState } from "react";

// the pill's share of the track
const PILL = 0.38;

export function LongScrollbar({ targetRef }) {
  const trackRef = useRef(null);
  // how far along the row is, 0 to 1
  const [at, setAt] = useState(0);
  const [needed, setNeeded] = useState(false);

  useEffect(() => {
    const row = targetRef.current;
    if (!row) return;
    const read = () => {
      const max = row.scrollWidth - row.clientWidth;
      setNeeded(max > 0);
      setAt(max > 0 ? row.scrollLeft / max : 0);
    };
    read();
    row.addEventListener("scroll", read, { passive: true });
    const sizes = new ResizeObserver(read);
    sizes.observe(row);
    return () => {
      row.removeEventListener("scroll", read);
      sizes.disconnect();
    };
  }, [targetRef]);

  // a position along the track (0–1 of the room the pill can travel) to a scroll
  const scrollTo = (fraction, behavior = "instant") => {
    const row = targetRef.current;
    const max = row.scrollWidth - row.clientWidth;
    row.scrollTo({ left: Math.min(1, Math.max(0, fraction)) * max, behavior });
  };

  const drag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const track = trackRef.current.getBoundingClientRect();
    const room = track.width * (1 - PILL);
    const startX = e.clientX;
    const startAt = at;
    const move = (ev) => scrollTo(startAt + (ev.clientX - startX) / room);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // pressing the track centres the pill on the press
  const jump = (e) => {
    const track = trackRef.current.getBoundingClientRect();
    const room = track.width * (1 - PILL);
    scrollTo((e.clientX - track.left - (track.width * PILL) / 2) / room, "smooth");
  };

  if (!needed) return null;

  return (
    <div ref={trackRef} onPointerDown={jump} className="relative mx-4 mb-2 h-3 shrink-0 cursor-pointer" aria-hidden>
      <div
        onPointerDown={drag}
        style={{ width: `${PILL * 100}%`, left: `${at * (1 - PILL) * 100}%` }}
        className="absolute inset-y-0 cursor-grab touch-none rounded-full bg-[#52525b] transition-colors hover:bg-[#71717a] active:cursor-grabbing"
      />
    </div>
  );
}
