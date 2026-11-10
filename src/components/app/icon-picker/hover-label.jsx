"use client";

// One name label for a whole grid: the cell under the pointer says what it is, above itself.
// One label moving, not a tooltip per cell — the grids have well over a thousand.

import { useState } from "react";

export function useHoverLabel() {
  const [hover, setHover] = useState(null);

  // on the grid's scroll box; the label is drawn in its parent, which is relative and doesn't scroll.
  // Cells carry data-label
  const handlers = {
    onMouseOver: (e) => {
      const cell = e.target.closest("[data-label]");
      if (!cell?.dataset.label) return setHover(null);
      const wrap = e.currentTarget.parentElement.getBoundingClientRect();
      const box = cell.getBoundingClientRect();
      setHover({ label: cell.dataset.label, left: box.left - wrap.left + box.width / 2, top: box.top - wrap.top });
    },
    onMouseLeave: () => setHover(null),
    onScroll: () => setHover(null),
  };

  const label = hover && (
    <span
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background"
      style={{ left: hover.left, top: hover.top - 4 }}
    >
      {hover.label}
    </span>
  );

  return { handlers, label };
}
