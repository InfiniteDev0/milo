"use client";

// Tabs down the book's outer edge, one per month, like a planner's. A month with pages opens at its first one.

import { pageDate } from "./pages";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function MonthTabs({ book }) {
  const slots = book.slots;
  const here = slots[book.spread * 2] ?? slots[book.spread * 2 + 1];
  const year = here ? pageDate(here).getFullYear() : new Date().getFullYear();

  // the first slot of each month this year
  const starts = new Map();
  slots.forEach((p, i) => {
    if (!p) return;
    const d = pageDate(p);
    if (d.getFullYear() === year && !starts.has(d.getMonth())) starts.set(d.getMonth(), i);
  });
  const month = here ? pageDate(here).getMonth() : null;

  return (
    <div className="absolute top-[3%] bottom-[3%] left-full hidden flex-col gap-[0.4%] sm:flex">
      <span className="py-1 pl-1.5 text-[10px] font-medium text-foreground/45 [writing-mode:vertical-rl]">{year}</span>
      {MONTHS.map((name, m) => {
        const at = starts.get(m);
        return (
          <button
            key={name}
            type="button"
            disabled={at == null}
            onClick={() => book.jump(Math.floor(at / 2))}
            aria-label={`${name} ${year}`}
            className={`flex min-h-0 flex-1 items-center justify-center rounded-r-md border border-l-0 px-1 text-[10px] tracking-wider transition-colors [writing-mode:vertical-rl] ${
              m === month
                ? "border-foreground/15 bg-[#efe4d2] text-[#27324d]"
                : at == null
                  ? "border-foreground/5 bg-foreground/3 text-foreground/25"
                  : "cursor-pointer border-foreground/10 bg-card text-foreground/60 hover:bg-[#efe4d2] hover:text-[#27324d]"
            }`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
