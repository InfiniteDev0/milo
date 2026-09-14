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

const place = (el, x, y, start) => {
  el.style.transform = `translate3d(${x - start.dx}px, ${y - start.dy}px, 0) rotate(2deg) scale(1.02)`;
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
      style={{ width: start.width }}
    >
      {children}
    </div>,
    document.body,
  );
}
