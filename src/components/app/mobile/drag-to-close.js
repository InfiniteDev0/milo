"use client";

// A drawer that closes the way a real one does (from Manasik): pull it down from anywhere (the
// handle, the title, or its content once that's scrolled to the top) and it follows the finger.
// Let go past a quarter of its height, or with a flick, and it slides away; short of that it
// springs back. Phones only.

import { useCallback, useEffect, useRef } from "react";

// iOS's own sheet curve, and how fast a flick is (px per ms)
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const FLICK = 0.5;

// the nearest scrolling box between the touch and the drawer, if any
function scrollerOf(target, drawer) {
  for (let node = target; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) return node;
    if (node === drawer) break;
  }
  return null;
}

// a ref for the drawer itself; onClose runs once it has slid out of sight
export function useDragToClose(onClose) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  const detach = useRef(null);

  return useCallback((element) => {
    detach.current?.();
    detach.current = null;
    if (!element || !window.matchMedia("(max-width: 767px)").matches) return;

    let start = null;
    let locked = null;
    let dy = 0;

    const place = (y, animate) => {
      element.style.transition = animate ? `transform 300ms ${EASE}` : "none";
      element.style.transform = y > 0 ? `translateY(${y}px)` : "";
    };
    const onStart = (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      start = { y: t.clientY, x: t.clientX, at: e.timeStamp, scroller: scrollerOf(e.target, element) };
      locked = null;
      dy = 0;
    };
    const onMove = (e) => {
      if (!start) return;
      const t = e.touches[0];
      const y = t.clientY - start.y;
      const x = t.clientX - start.x;
      if (locked === null) {
        if (Math.hypot(x, y) < 6) return;
        // only a pull downward, once whatever it's on is at its top
        locked = y > 0 && Math.abs(y) > Math.abs(x) && (!start.scroller || start.scroller.scrollTop <= 0);
        if (!locked) {
          start = null;
          return;
        }
      }
      e.preventDefault();
      dy = Math.max(0, y);
      place(dy, false);
    };
    const onEnd = (e) => {
      if (!start || !locked) {
        start = null;
        return;
      }
      const speed = dy / Math.max(1, e.timeStamp - start.at);
      start = null;
      if (dy > element.offsetHeight * 0.25 || speed > FLICK) {
        place(element.offsetHeight + 40, true);
        window.setTimeout(() => close.current(), 260);
      } else place(0, true);
    };

    element.addEventListener("touchstart", onStart, { passive: true });
    // not passive: once it's a pull, what's underneath mustn't scroll too
    element.addEventListener("touchmove", onMove, { passive: false });
    element.addEventListener("touchend", onEnd);
    element.addEventListener("touchcancel", onEnd);
    detach.current = () => {
      element.removeEventListener("touchstart", onStart);
      element.removeEventListener("touchmove", onMove);
      element.removeEventListener("touchend", onEnd);
      element.removeEventListener("touchcancel", onEnd);
    };
  }, []);
}
