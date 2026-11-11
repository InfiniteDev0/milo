"use client";

// One of a category's two cards (Tasks, Notes), drawn like a By block card: a title pill, its
// search and +, a line saying what's in it with its count, its search box and selection bar when
// they're open, then the rows, which scroll inside the card and drag into an order by their grip.

import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

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

// the round magnifier beside it, lit while its search box is open
export function SearchButton({ label, on, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-8 cursor-pointer items-center justify-center rounded-full border border-foreground/15 text-foreground/60 transition-colors hover:text-foreground",
        on && "border-foreground/40 text-foreground",
      )}
    >
      <Search className="size-4" />
    </button>
  );
}

// the card's own search box, under its count
export function SearchBox({ value, onChange, placeholder }) {
  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="h-9 shrink-0 rounded-lg border border-foreground/10 bg-card px-3 text-sm outline-none focus:border-foreground/30"
    />
  );
}

// actions: the buttons at the top right. tools: the search box and selection bar, when open.
// empty: said when there are no rows
export function CategoryPanel({ title, sub, count, unit, actions, tools, empty, children }) {
  return (
    <section className="flex h-80 flex-col gap-3 rounded-2xl bg-foreground/4 p-4">
      <div className="flex h-8 items-center justify-between gap-2">
        <span className="truncate rounded-lg bg-card px-3 py-1.5 text-sm font-medium ring-1 ring-foreground/10">{title}</span>
        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
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
      {tools}
      {/* the rows bring their own scrolling list (ReorderList) */}
      {empty ? <p className="py-6 text-center text-xs text-foreground/35">{empty}</p> : children}
    </section>
  );
}
