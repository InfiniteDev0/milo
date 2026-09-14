"use client";

// Search every note's title and text, and narrow by when it was written.

import { Search } from "lucide-react";
import { RANGES } from "@/lib/note-filters";
import { Segmented } from "../settings/row";

export function Filters({ query, onQuery, range, onRange }) {
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

      <Segmented label="When the note was written" value={range} options={RANGES} onChange={onRange} />
    </div>
  );
}
