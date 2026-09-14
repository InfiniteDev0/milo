"use client";

// Rest TAKES the lineup while it lasts. There is nothing to start until it is
// over, so the row of blocks has nothing to say — and a pill floating over the
// day was landing on whatever happened to be underneath it.

import { useEffect, useState } from "react";
import MiloFace from "@/components/MiloFace";
import { Button } from "@/components/ui/button";
import { useBlocks } from "./blocks-provider";

function format(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function RestPill() {
  const { rest, skipRest } = useBlocks();
  const [now, setNow] = useState(() => Date.now());

  // seconds here, unlike everywhere else: a countdown you can watch tick down
  useEffect(() => {
    if (!rest) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [rest]);

  if (!rest) return null;

  return (
    // Full width, like a block card — it is standing in for the whole row.
    <div className="flex w-full pb-2">
      <div className="flex h-16 w-full items-center justify-center gap-2.5 rounded-xl bg-chrome px-4 shadow-[0_6px_24px_rgba(0,0,0,0.25)]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-chip">
          <MiloFace mood="sleepy" gaze={false} className="size-8" />
        </span>
        <span className="text-sm text-chrome-ink/70">
          Resting after {rest.blockName.replace(" Block", "")} ·{" "}
          <span className="tabular-nums">{format(rest.until - now)}</span>
        </span>
        <Button
          type="button"
          size="sm"
          onClick={skipRest}
          className="h-7 cursor-pointer rounded-lg bg-chip px-3 text-xs text-chip-ink hover:bg-chip/85"
        >
          skip
        </Button>
      </div>
    </div>
  );
}
