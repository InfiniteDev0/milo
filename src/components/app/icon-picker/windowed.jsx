"use client";

/* A long grid that only draws the rows in view, plus a few either side — so
   1,800 icons or 1,900 emoji scroll as lightly as forty. Every row (a section
   heading or a row of ten) is the same height, so where each sits is just its
   index times that, with nothing to measure. */

import { useState } from "react";

export const ROW = 32;
export const COLUMNS = 10;
const SPARE = 6;

// cut a list into rows of ten
export function rowsOf(items, key) {
  const rows = [];
  for (let i = 0; i < items.length; i += COLUMNS) rows.push({ key: `${key}-${i}`, items: items.slice(i, i + COLUMNS) });
  return rows;
}

// rows: [{ key, heading } | { key, items }]. boxRef: the scroll box, for jumps
export function Windowed({ rows, height, renderCell, boxRef, onScroll, hover }) {
  const [top, setTop] = useState(0);
  const first = Math.max(0, Math.floor(top / ROW) - SPARE);
  const last = Math.min(rows.length, Math.ceil((top + height) / ROW) + SPARE);

  return (
    <div
      ref={boxRef}
      {...hover}
      onScroll={(e) => {
        setTop(e.currentTarget.scrollTop);
        hover?.onScroll?.();
        onScroll?.(e.currentTarget.scrollTop);
      }}
      style={{ height }}
      className="scrollbar-pill overflow-y-auto overscroll-contain px-3"
    >
      <div className="relative" style={{ height: rows.length * ROW + 8 }}>
        {rows.slice(first, last).map((row, i) => (
          <div key={row.key} className="absolute inset-x-0" style={{ top: (first + i) * ROW, height: ROW }}>
            {row.heading ? (
              <h3 className="flex h-full items-end pb-1 text-xs font-medium text-muted-foreground">{row.heading}</h3>
            ) : (
              <div className="grid grid-cols-10">{row.items.map(renderCell)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
