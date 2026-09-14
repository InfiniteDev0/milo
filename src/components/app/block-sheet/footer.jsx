"use client";

// Start, a break, and stop. Nothing destructive lives next to the button you press daily.

import { Pause, Play, Square } from "lucide-react";
import { PAUSE, PAUSE_INK } from "@/lib/palette";
import { shade } from "@/lib/shade";
import { useBlocks } from "../blocks-provider";

export function Footer({ block, running, onClose }) {
  const { start, paused, pauseDay } = useBlocks();

  // A finished block offering to Start reads like it never happened.
  const done = block.status === "done";

  if (running) {
    return (
      <div className="flex gap-2">
        {/* a break keeps your block and the exact task, and picks up on the same line */}
        <button
          type="button"
          onClick={() => {
            pauseDay();
            onClose();
          }}
          style={{ backgroundColor: PAUSE, color: PAUSE_INK, "--lift": shade(PAUSE) }}
          className="milo-lift flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
        >
          <Pause className="size-4" />
          Take a break
        </button>

        {/* quieter on purpose: stopping ends this stretch of the block, not your day */}
        <button
          type="button"
          onClick={() => {
            start(block.id);
            onClose();
          }}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-foreground/10 px-4 py-2.5 text-sm text-foreground/60 transition-colors hover:text-foreground"
        >
          <Square className="size-3.5" />
          Stop
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        start(block.id);
        onClose();
      }}
      // Start wears the block's colour because starting is about THAT block
      style={{ backgroundColor: block.bg, color: block.ink, "--lift": shade(block.bg) }}
      className="milo-lift flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
    >
      <Play className="size-4" />
      {done ? "Start it again" : paused ? "Pick the day up here" : "Start this block"}
    </button>
  );
}
