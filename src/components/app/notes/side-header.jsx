"use client";

// The left section's top line: its name, then search and « (close the section, Ctrl+\).
// The search icon opens the search box under it; Esc or emptying it and clicking away closes it.

import { useState } from "react";
import { ChevronsLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tip } from "../tasks-view/tip";
import { markStep } from "../whats-new/steps";

// folding it counts for the What's new step
const fold = (fn) => () => {
  markStep("notes-sidebar");
  fn();
};

const ICON = "flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground";

// the shortcut beside a tip's words
const Keys = ({ label }) => (
  <span className="flex items-center gap-1.5">
    {label}
    <span className="text-background/60">Ctrl \</span>
  </span>
);

export function SideHeader({ title, query, onQuery, onClose }) {
  const [searching, setSearching] = useState(false);
  const open = searching || Boolean(query);
  const close = () => {
    onQuery("");
    setSearching(false);
  };
  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div className="flex h-8 items-center gap-1 ps-1.5">
        <span className="min-w-0 flex-1 truncate text-base font-semibold">{title}</span>
        <Tip label="Search">
          <button type="button" onClick={() => (open ? close() : setSearching(true))} aria-label="Search notes" aria-pressed={open} className={cn(ICON, open && "bg-foreground/[0.06] text-foreground")}>
            <Search className="size-4" />
          </button>
        </Tip>
        <Tip label={<Keys label="Close sidebar" />}>
          <button type="button" onClick={fold(onClose)} data-tour="notes-sidebar" aria-label="Close sidebar" className={ICON}>
            <ChevronsLeft className="size-4" />
          </button>
        </Tip>
      </div>
      {open && (
        <label className="flex h-9 items-center gap-2 rounded-md border border-foreground/20 bg-card px-2.5 dark:border-border">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && close()}
            onBlur={() => !query && setSearching(false)}
            placeholder="Search…"
            aria-label="Search notes"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button type="button" onClick={close} aria-label="Clear the search" className="cursor-pointer text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </label>
      )}
    </div>
  );
}

