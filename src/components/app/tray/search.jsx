"use client";

// Floats over the stack rather than sitting under it, so it stays reachable
// however far the list scrolls.

import { Search as SearchIcon } from "lucide-react";

export function Search({ value, onChange, label = "Search today’s notes" }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4">
      <div className="pointer-events-auto flex h-13 w-full max-w-sm items-center gap-2.5 rounded-full bg-chrome pl-5 pr-4 shadow-[0_8px_24px_rgba(0,0,0,0.22)]">
        <SearchIcon className="size-[18px] shrink-0 text-chrome-ink/45" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label}
          aria-label={label}
          className="min-w-0 flex-1 bg-transparent text-sm text-chrome-ink outline-none placeholder:text-chrome-ink/35"
        />
      </div>
    </div>
  );
}
