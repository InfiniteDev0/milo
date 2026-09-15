"use client";

// The lineup as names only: which block you're looking at, and which ones are set aside that day.

import { EMPTY_PLAN } from "@/lib/db/plans";
import { useBlocks } from "../blocks-provider";

export function BlockPills({ blocks, at, stamp, ahead, onPick }) {
  const { plans } = useBlocks();
  const plan = plans[stamp] ?? EMPTY_PLAN;
  const aside = (b) => (ahead ? plan.setAside.includes(b.id) : b.dropped);

  return (
    <div className="scrollbar-pill flex shrink-0 gap-2 overflow-x-auto px-5 pt-1 pb-4">
      {blocks.map((b, i) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onPick(i)}
          aria-pressed={i === at}
          style={{ backgroundColor: b.bg, color: b.ink }}
          className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity ${
            i === at
              ? "ring-2 ring-foreground/70 ring-offset-2 ring-offset-card"
              : aside(b)
                ? "opacity-35 hover:opacity-70"
                : "opacity-70 hover:opacity-100"
          }`}
        >
          {b.name.replace(" Block", "")}
        </button>
      ))}
    </div>
  );
}
