"use client";

// Search every note's title and text. Narrowing by when it was written (All time / Today / This
// week / This month) is off for now: RANGES in lib/note-filters still has it, ready to return.

import { Search } from "lucide-react";

export function Filters({ query, onQuery }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-foreground/10 bg-card px-3 sm:max-w-xs">
        <Search className="size-4 shrink-0 text-foreground/35" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search notes"
          aria-label="Search notes"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/35"
        />
      </label>

    </div>
  );
}
