"use client";

/* The tap on the shoulder while a block is running.
 *
 * This exists because untracked work runs long. Four or five hours in one block
 * doesn't feel like four hours from the inside — it ends in eye strain, then a
 * break that turns into a doomscroll, then the rest of the day's blocks gone.
 * The other blocks aren't skipped by decision; they're skipped because the
 * first one never stopped.
 *
 * SO WHY THIS IS ALLOWED, when Milo interrupts nobody:
 *
 *   "You've done 3 of 5 blocks"        — a verdict on your day.        Banned.
 *   "You've been in Deep Work 2 hours" — a fact about right now.       Fine.
 *
 * The first tells you what you failed to do. The second tells you what is
 * happening, which is the thing you cannot feel from inside it. That is the
 * externalising-time intervention from RESEARCH.md, and it is the whole point.
 *
 * THE RULES:
 *   - it states the elapsed time. It never says "too long", never "take a
 *     break", never "you should". No instruction, no warning colour.
 *   - it does not stop the clock, pause the block, or require an answer.
 *   - it names the next block, because the alternative to Deep Work at hour
 *     four is not rest — it's TikTok. Showing you your own plan is not the app
 *     deciding; POSITIONING commitment 5 makes you the author, and this is
 *     reading your own line back to you.
 *   - the interval is yours, including never. Commitment 9.
 */

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import MiloFace from "@/components/MiloFace";
import { Button } from "@/components/ui/button";
import { spent, useNow } from "@/lib/time";
import { useBlocks } from "./blocks-provider";

export function CheckIn() {
  const { blocks, ongoing, checkInMinutes, spentOnBlock, start } = useBlocks();

  // how many intervals the user has already waved away for this block
  const [seen, setSeen] = useState(0);
  const [blockId, setBlockId] = useState(null);

  const now = useNow(Boolean(ongoing) && checkInMinutes > 0, 15000);

  // a new block starts its own count
  useEffect(() => {
    if (ongoing?.id !== blockId) {
      setBlockId(ongoing?.id ?? null);
      setSeen(0);
    }
  }, [ongoing?.id, blockId]);

  if (!ongoing || !checkInMinutes || !now) return null;

  const elapsed = spentOnBlock(ongoing.id, now);
  const due = Math.floor(elapsed / (checkInMinutes * 60000));
  if (due <= seen) return null;

  /* The next block in the line, if there is one. Not a suggestion — the order
     is the one you put them in. */
  const order = blocks.filter((b) => b.status !== "done");
  const here = order.findIndex((b) => b.id === ongoing.id);
  const next = here >= 0 ? order[here + 1] : null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 pr-24 pointer-events-none items-center [&>*]:pointer-events-auto">
      <div className="flex items-center gap-3 rounded-2xl bg-chrome py-2 pr-2 pl-2 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chip">
          {/* content, not concerned. It is telling you the time, not worrying
              about you — a worried face here would be a judgement with no
              words in it. */}
          <MiloFace mood="content" instant gaze={false} reactToScroll={false} className="size-9" />
        </span>

        <div className="flex flex-col">
          <span className="text-sm text-chrome-ink">
            {spent(elapsed)} in {ongoing.name.replace(" Block", "")}.
          </span>
          {next && (
            <span className="text-xs text-chrome-ink/45">
              {next.name.replace(" Block", "")} is next, whenever you want it.
            </span>
          )}
        </div>

        {next && (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setSeen(due);
              start(next.id);
            }}
            className="h-8 cursor-pointer rounded-lg bg-chip px-3 text-xs text-chip-ink hover:bg-chip/85"
          >
            Switch
          </Button>
        )}

        {/* Staying is a real answer, so dismissing costs one tap and says
            nothing back. */}
        <button
          type="button"
          onClick={() => setSeen(due)}
          aria-label="Keep going"
          className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-chrome-ink/40 transition-colors hover:bg-chrome-ink/10 hover:text-chrome-ink"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
