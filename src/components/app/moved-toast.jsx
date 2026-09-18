"use client";

// Said once a move lands: how many notes or tasks, and the block they now belong to.

import { toast } from "sonner";
import MiloFace from "@/components/MiloFace";

function MovedToast({ count, to, noun }) {
  const name = to ? to.name.replace(" Block", "") : "Day notes";
  const one = count === 1;

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
          {one ? "Moved to" : `${count} ${noun}s moved to`}
          <span
            className={`rounded-md px-1.5 py-0.5 text-xs ${to ? "" : "bg-card text-foreground"}`}
            style={to ? { backgroundColor: to.bg, color: to.ink } : undefined}
          >
            {name}
          </span>
        </span>
        <span className="text-xs text-chrome-ink/45">
          {one ? `Same ${noun}, new home.` : `Same ${noun}s, new home.`}
        </span>
      </div>
    </div>
  );
}

// `to` null means the day's own notes; `noun` is "note" or "task"
export function showMovedToast({ count, to, noun }) {
  toast.custom(() => <MovedToast count={count} to={to} noun={noun} />, {
    unstyled: true,
    id: `milo-${noun}s-moved`,
    duration: 3000,
  });
}
