"use client";

// The picker's filter, and the square buttons beside it (Random, skin tone, icon colour)

import { Search } from "lucide-react";

export const SQUARE =
  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-foreground/15 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground data-popup-open:bg-foreground/10";

export function FilterBox({ value, onChange }) {
  return (
    <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-foreground/15 px-2.5 focus-within:border-[#2f80ed] focus-within:ring-1 focus-within:ring-[#2f80ed]">
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filter…"
        aria-label="Filter"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}
