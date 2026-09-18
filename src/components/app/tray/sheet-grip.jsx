"use client";

// Drag the notes sheet by this bar: let go on the left, middle or right of the screen and it stays there.
// Arrow keys move it too.

import { useRef } from "react";
import { PLACES, setSheetPosition } from "@/lib/sheet-position";

export function SheetGrip({ position }) {
  const drag = useRef(null);

  const down = (e) => {
    const sheet = e.currentTarget.closest("[data-sheet]");
    if (!sheet) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, sheet };
  };

  // follows the pointer by hand, so the note inside doesn't re-render on every move
  const move = (e) => {
    const d = drag.current;
    if (d) d.sheet.style.transform = `translateX(${e.clientX - d.x}px)`;
  };

  const up = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const r = d.sheet.getBoundingClientRect();
    const middle = r.left + r.width / 2;
    const third = window.innerWidth / 3;
    d.sheet.style.transform = "";
    setSheetPosition(middle < third ? "left" : middle > third * 2 ? "right" : "center");
  };

  const key = (e) => {
    const at = PLACES.indexOf(position);
    if (e.key === "ArrowLeft" && at > 0) setSheetPosition(PLACES[at - 1]);
    else if (e.key === "ArrowRight" && at < PLACES.length - 1) setSheetPosition(PLACES[at + 1]);
    else return;
    e.preventDefault();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Move the notes: drag, or use the arrow keys"
      title="Drag to move"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key}
      className="absolute top-0 left-1/2 z-10 flex h-4 w-24 -translate-x-1/2 cursor-grab touch-none items-center justify-center rounded-b-lg active:cursor-grabbing"
    >
      <span className="h-1 w-10 rounded-full bg-foreground/20" />
    </div>
  );
}
