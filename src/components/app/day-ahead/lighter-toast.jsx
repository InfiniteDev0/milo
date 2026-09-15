"use client";

// Said when a day gets lighter: a task sits it out, or a block steps aside. Facts, and when it comes back.

import MiloFace from "@/components/MiloFace";

export function LighterToast({ ahead }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-chrome py-2.5 pl-2.5 pr-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip">
        <MiloFace
          mood="content"
          instant
          gaze={false}
          blink={false}
          reactToScroll={false}
          className="size-10"
        />
      </span>

      <div className="flex flex-col">
        <span className="text-sm text-chrome-ink">
          {ahead ? "Tomorrow got lighter." : "Today got lighter."}
        </span>
        <span className="text-xs text-chrome-ink/45">
          {ahead ? "It’s back the day after." : "It’s back tomorrow."}
        </span>
      </div>
    </div>
  );
}
