"use client";

// Said once a move lands: how many notes, and the block they now belong to.

import MiloFace from "@/components/MiloFace";

export function MovedToast({ count, to }) {
  const name = to ? to.name.replace(" Block", "") : "Day notes";

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-chrome py-2.5 pl-2.5 pr-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip">
        <MiloFace
          mood="happy"
          instant
          gaze={false}
          blink={false}
          reactToScroll={false}
          className="size-10"
        />
      </span>

      <div className="flex flex-col gap-1">
        <span className="flex flex-wrap items-center gap-1.5 text-sm text-chrome-ink">
          {count === 1 ? "Moved to" : `${count} notes moved to`}
          <span
            className={`rounded-md px-1.5 py-0.5 text-xs ${to ? "" : "bg-card text-foreground"}`}
            style={to ? { backgroundColor: to.bg, color: to.ink } : undefined}
          >
            {name}
          </span>
        </span>
        <span className="text-xs text-chrome-ink/45">
          {count === 1 ? "Same note, new home." : "Same notes, new home."}
        </span>
      </div>
    </div>
  );
}
