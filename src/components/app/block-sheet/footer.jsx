"use client";

// Start and stop. Nothing destructive lives next to the button you press daily.

import { Play, Square } from "lucide-react";
import { PAUSE, PAUSE_INK } from "@/lib/palette";
import { shade } from "@/lib/shade";
import { useBlocks } from "../blocks-provider";

export function Footer({ block, running, onClose }) {
  const { start, paused } = useBlocks();

  // A finished block offering to Start reads like it never happened.
  const done = block.status === "done";

  return (
    <button
      type="button"
      onClick={() => {
        start(block.id);
        onClose();
      }}
      /* Start wears the block's colour because starting is about THAT block.
         Stop wears the app's yellow because stopping means the same everywhere. */
      style={
        running
          ? { backgroundColor: PAUSE, color: PAUSE_INK, "--lift": shade(PAUSE) }
          : { backgroundColor: block.bg, color: block.ink, "--lift": shade(block.bg) }
      }
      className="milo-lift flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
    >
      {running ? (
        <>
          <Square className="size-3.5" />
          Stop this block
        </>
      ) : (
        <>
          <Play className="size-4" />
          {done
            ? "Start it again"
            : paused
              ? "Pick the day up here"
              : "Start this block"}
        </>
      )}
    </button>
  );
}
