"use client";

// Before the day's first block: today's theme, and a way to look at the day one block at a time.
// It never opens anything by itself, and it's gone the moment a block starts.

import { Sunrise } from "lucide-react";
import { useBlocks } from "../blocks-provider";
import { DayTheme } from "../day-theme";

export function MorningCard() {
  const { day } = useBlocks();
  if (day.startedAt || day.endedAt) return null;

  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-card p-4 text-left ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-foreground/60">Before you start</span>
        <DayTheme className="py-0.5 text-xs" />
      </div>

      <p className="text-sm text-foreground/50">
        See what’s in each block today, set anything aside, or look at tomorrow.
      </p>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent("milo:day-ahead", { detail: "today" }))}
        style={{ "--lift": "var(--chrome-lift)" }}
        className="milo-lift flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-chrome px-4 py-2 text-sm text-chrome-ink"
      >
        <Sunrise className="size-4" />
        Open the Day ahead
      </button>
    </div>
  );
}
