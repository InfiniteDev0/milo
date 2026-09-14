"use client";

/* What Milo says when you finish something.
 *
 * Varied on purpose — the same sentence every time stops registering after a
 * day. But it stays in Milo's voice: warm and specific, never hype, and never
 * about a streak. "You're on fire, 5 days running!" is one bad day away from
 * "you broke your streak", and that moment is the thing this product exists to
 * refuse. So the headline changes and the subline is simply the true count,
 * which only ever goes up.
 */

import { toast } from "sonner";
import MiloFace from "@/components/MiloFace";

const FIRST = [
  "First one down.",
  "That's one.",
  "Off the mark.",
];

const ORDINARY = [
  "Nice. That's done.",
  "One more off the pile.",
  "Done.",
  "That's another.",
  "Milo saw that.",
  "Good one.",
  "Ticked.",
];

const LONG_TASK = [
  "That was a long one.",
  "Big one, done.",
  "That took a while. Worth it.",
];

const RUN = [
  "Two in a row.",
  "Three in a row now.",
  "You're rolling.",
  "Another one, back to back.",
];

let lastPicked = null;

/** Never the same line twice running — repetition is what kills the effect. */
function pick(list) {
  const options = list.length > 1 ? list.filter((l) => l !== lastPicked) : list;
  const choice = options[Math.floor(Math.random() * options.length)];
  lastPicked = choice;
  return choice;
}

/**
 * @param task           the task just finished
 * @param block          the block it belongs to
 * @param doneToday      how many things have been finished today, including this
 * @param blockComplete  did this finish every task in its block
 * @param run            consecutive completions without a gap
 * @returns the Milo pose to hold for a moment
 */
export function celebrateTask({ task, block, doneToday, blockComplete, run }) {
  let headline;
  let mood = "happy";

  if (blockComplete) {
    // The biggest moment in the product: a whole block finished.
    headline = `${block.name.replace(" Block", "")} — that's the whole block.`;
    mood = "cheer";
  } else if (doneToday === 1) {
    headline = pick(FIRST);
    mood = "content";
  } else if (task.minutes >= 60) {
    headline = pick(LONG_TASK);
    mood = "proud";
  } else if (run >= 2) {
    headline = pick(RUN);
    mood = "proud";
  } else {
    headline = pick(ORDINARY);
  }

  toast.custom(
    () => (
      <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl bg-chrome py-2.5 pl-2.5 pr-5">
        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip">
          <MiloFace
            mood={mood}
            instant
            gaze={false}
            blink={false}
            reactToScroll={false}
            className="size-10 touch-none select-none"
          />
        </span>
        <div className="relative flex flex-col">
          <span className="text-sm text-chrome-ink">{headline}</span>
          {/* the promise, verbatim, and a number that only counts up */}
          <span className="text-xs text-chrome-ink/45">
            You showed up for {doneToday} {doneToday === 1 ? "thing" : "things"} today.
          </span>
        </div>
      </div>
    ),
    {
      unstyled: true,
      // one id means a new completion REPLACES the last toast instead of
      // stacking a pile of them up the screen
      id: "milo-celebrate",
      duration: blockComplete ? 5000 : 3000,
    },
  );

  return mood;
}
