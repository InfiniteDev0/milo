"use client";

// One of a category's two cards (Tasks, Notes), drawn like a By block card: a title pill, a +,
// a line saying what's in it with its count, then the rows, which scroll inside the card.

import { Plus } from "lucide-react";

export const ROW =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-card/70";

// the round + at a card's top right
export function AddButton({ label, onClick, tour }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-tour={tour}
      aria-label={label}
      title={label}
      className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-solid text-solid-ink hover:bg-solid-hover"
    >
      <Plus className="size-4" />
    </button>
  );
}

// top: a row above the others (a new task being typed). empty: said when there are no rows
export function CategoryPanel({ title, sub, count, unit, action, top, empty, children }) {
  return (
    <section className="flex h-80 flex-col gap-3 rounded-2xl bg-foreground/4 p-4">
      <div className="flex h-8 items-center justify-between gap-2">
        <span className="truncate rounded-lg bg-card px-3 py-1.5 text-sm font-medium ring-1 ring-foreground/10">{title}</span>
        {action}
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-foreground/45">
        <span className="min-w-0 truncate">{sub}</span>
        {count != null && (
          <span className="shrink-0 tabular-nums">
            {count} {unit}
            {count === 1 ? "" : "s"}
          </span>
        )}
      </div>
      <ul className="scrollbar-pill m-0 flex min-h-0 flex-1 list-none flex-col gap-1.5 overflow-y-auto p-0">
        {top}
        {empty && !top ? <li className="py-6 text-center text-xs text-foreground/35">{empty}</li> : children}
      </ul>
    </section>
  );
}
