"use client";

// Phones only, as ClickUp: pull the page down from its top and a search pill drops in under the
// header; let go once it's far enough and search opens. Only a downward pull, only when what's
// under the finger is already at its top, and never inside a sheet or a dialog.

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// how far to pull (px) before letting go opens search
const ENOUGH = 70;

// true when nothing between the touch and the page is scrolled away from its top
function atTop(target) {
  for (let node = target; node && node !== document.body; node = node.parentElement) {
    if (node.closest?.("[role=dialog]")) return false;
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollTop > 0) return false;
  }
  return true;
}

export function PullToSearch() {
  const [pull, setPull] = useState(0);
  const [letGo, setLetGo] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    let start = null;
    let locked = null;
    let dy = 0;
    const onStart = (e) => {
      if (e.touches.length !== 1 || !atTop(e.target)) return;
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      locked = null;
      dy = 0;
      setLetGo(false);
    };
    const onMove = (e) => {
      if (!start) return;
      const x = e.touches[0].clientX - start.x;
      const y = e.touches[0].clientY - start.y;
      if (locked === null) {
        if (Math.hypot(x, y) < 8) return;
        // a downward pull, not a sideways swipe between days
        locked = y > 0 && Math.abs(y) > Math.abs(x) * 1.2;
        if (!locked) {
          start = null;
          return;
        }
      }
      // it gives a little less the further it goes, like a rubber band
      dy = Math.max(0, y) * 0.5;
      setPull(dy);
    };
    const onEnd = () => {
      if (start && locked && dy >= ENOUGH) window.dispatchEvent(new Event("milo:search"));
      start = null;
      dy = 0;
      setLetGo(true);
      setPull(0);
    };
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  const ready = pull >= ENOUGH;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.5rem)] z-50 flex justify-center md:hidden", letGo && "transition-[translate,opacity] duration-300 ease-out")}
      style={{ translate: `0 ${Math.min(pull, 110) - 56}px`, opacity: Math.min(1, pull / ENOUGH) }}
    >
      <span className={cn("flex h-10 items-center gap-2 rounded-full bg-popover px-4 text-sm font-medium shadow-lg transition-colors", ready && "bg-solid text-solid-ink")}>
        <Search className="size-4" />
        {ready ? "Let go to search" : "Pull to search"}
      </span>
    </div>
  );
}
