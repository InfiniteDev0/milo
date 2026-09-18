"use client";

// A solid copy of whatever is being dragged, held under the pointer.
// The browser's own drag picture is faded and can't be made solid, so it is swapped for nothing and this is drawn instead.

import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

let blank = null;

// call in onDragStart: hides the browser's faded picture
export function hideDragImage(e) {
  if (!blank) {
    blank = document.createElement("div");
    blank.style.cssText = "position:fixed;top:0;left:-10px;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(blank);
  }
  e.dataTransfer.setDragImage(blank, 0, 0);
}

// call in onDragStart: where the pointer caught the element, so the copy doesn't jump
export function dragStart(e) {
  const r = e.currentTarget.getBoundingClientRect();
  return { x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, width: r.width };
}

// anything marked data-drag-magnet pulls the copy in as the pointer nears it, shrinking it on the way (Vercel's hide-the-toolbar X)
const PULL_FROM = 180;
const PULL_FULL = 80;

const place = (el, x, y, start) => {
  let px = x;
  let py = y;
  let t = 0;
  const magnet = document.querySelector("[data-drag-magnet]");
  if (magnet) {
    const m = magnet.getBoundingClientRect();
    const cx = m.left + m.width / 2;
    const cy = m.top + m.height / 2;
    t = Math.min(1, Math.max(0, (PULL_FROM - Math.hypot(cx - x, cy - y)) / (PULL_FROM - PULL_FULL)));
    px += (cx - x) * t * 0.8;
    py += (cy - y) * t * 0.8;
  }
  el.style.transform = `translate3d(${px - start.dx}px, ${py - start.dy}px, 0) rotate(${2 * (1 - t)}deg) scale(${1.02 - 0.7 * t})`;
};

export function DragFollower({ start, onEnd, children }) {
  const node = useRef(null);
  const end = useRef(onEnd);

  useEffect(() => {
    end.current = onEnd;
  });

  // placed once here, then moved by hand — a re-render mid-drag must not snap it back
  useLayoutEffect(() => {
    if (start && node.current) place(node.current, start.x, start.y, start);
  }, [start]);

  useEffect(() => {
    if (!start) return;
    const move = (e) => {
      // some browsers report 0,0 on the last event of a drag
      if ((e.clientX === 0 && e.clientY === 0) || !node.current) return;
      place(node.current, e.clientX, e.clientY, start);
    };
    // after the drop target has had its turn; also covers a source that unmounted and never gets its dragend
    const finish = () => setTimeout(() => end.current?.(), 0);
    document.addEventListener("dragover", move);
    document.addEventListener("drop", finish, true);
    document.addEventListener("dragend", finish, true);
    return () => {
      document.removeEventListener("dragover", move);
      document.removeEventListener("drop", finish, true);
      document.removeEventListener("dragend", finish, true);
    };
  }, [start]);

  if (!start) return null;

  return createPortal(
    <div
      ref={node}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-100 text-foreground"
      // shrinks around where the pointer holds it, so it stays under the pointer as it's pulled in
      style={{ width: start.width, transformOrigin: `${start.dx}px ${start.dy}px` }}
    >
      {children}
    </div>,
    document.body,
  );
}
