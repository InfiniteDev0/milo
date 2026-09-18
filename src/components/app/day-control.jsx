"use client";

// Pause the day, one press from the day header — for the interruptions that don't wait for a block to finish.
// The running block and task are remembered, and picking the day back up puts you straight back in.
// A paused day accrues nothing and is never reported as time lost.

import { Pause, Play } from "lucide-react";
import { DONE, DONE_INK, PAUSE, PAUSE_INK } from "@/lib/palette";
import { shade } from "@/lib/shade";
import { useBlocks } from "./blocks-provider";

export function DayControl() {
  const { day, paused, pauseDay, resumeDay } = useBlocks();

  // nothing to pause before the day has begun, or once it's closed
  if (!day.startedAt || (day.endedAt && !paused)) return null;

  const bg = paused ? DONE : PAUSE;
  const label = paused ? "Pick the day back up" : "Pause the day";

  return (
    <button
      type="button"
      onClick={paused ? resumeDay : pauseDay}
      aria-label={label}
      title={label}
      style={{ backgroundColor: bg, color: paused ? DONE_INK : PAUSE_INK, "--lift": shade(bg) }}
      className="milo-lift flex h-9 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm"
    >
      {paused ? <Play className="size-4" fill="currentColor" /> : <Pause className="size-4" fill="currentColor" />}
      <span className="hidden sm:inline">{paused ? "Pick up" : "Pause day"}</span>
    </button>
  );
}
