"use client";

/* Rest, and ending the day.
 *
 * Rest is a real state, not dead time — a block finishing opens one, and Milo
 * rests with you. It nudges once when it's up, and never again; the setting for
 * how often Milo speaks includes never.
 *
 * Ending the day is a button you press, never a 9pm notification. You'd ignore
 * that on exactly the days it matters, and being nagged at night about an
 * unfinished day is the moment this product exists to refuse. An unended day
 * simply ends.
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import MiloFace from "@/components/MiloFace";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBlocks } from "./blocks-provider";
import { CloseDay } from "./close-day";
import { Button } from "../ui/button";

function format(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function DayBar() {
  const { rest, skipRest, summary, blocks } = useBlocks();
  const [now, setNow] = useState(() => Date.now());
  const [showReflection, setShowReflection] = useState(false);
  const [closing, setClosing] = useState(false);

  // opened from the date button, which is a sibling and cannot pass a prop
  useEffect(() => {
    const open = () => setClosing(true);
    window.addEventListener("milo:close-day", open);
    return () => window.removeEventListener("milo:close-day", open);
  }, []);

  // Only ticks while resting — no interval running through the whole day.
  useEffect(() => {
    if (!rest) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [rest]);

  // One nudge, when the rest is up. Not a countdown of reminders.
  useEffect(() => {
    if (!rest || now < rest.until) return;
    toast.custom(
      () => (
        <div className="flex items-center gap-3 rounded-2xl bg-chrome py-2.5 pl-2.5 pr-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip">
            <MiloFace mood="content" instant gaze={false} blink={false} reactToScroll={false} className="size-10" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm text-chrome-ink">Back when you&apos;re ready.</span>
            <span className="text-xs text-chrome-ink/45">No rush.</span>
          </div>
        </div>
      ),
      { unstyled: true, id: "milo-rest", duration: 4000 },
    );
    skipRest();
  }, [rest, now, skipRest]);


  return (
    <>
      {/* No button here any more. Ending the day is one of the two things
          you can do TO a day, and both of them now live under the date —
          which is the day. Three doors to two actions was one door too
          many, and none of them said what they did. */}

      <Dialog open={closing} onOpenChange={setClosing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="sr-only">
            <DialogTitle>Close the day</DialogTitle>
          </DialogHeader>
          <CloseDay onClose={() => setClosing(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showReflection} onOpenChange={setShowReflection}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center gap-3 text-center">
            <MiloFace mood="proud" instant gaze={false} className="dark:rounded-[30%] dark:bg-chip size-16" />
            {/* Actuals only. Never "6 of 8", never a percentage, never a gap. */}
            <DialogTitle className="text-center text-2xl">
              You showed up for {summary.done}{" "}
              {summary.done === 1 ? "thing" : "things"} today.
            </DialogTitle>
            <DialogDescription className="text-center">
              {summary.blocksDone > 0
                ? `${summary.blocksDone} of your ${blocks.length} blocks ran all the way through.`
                : "However today went, it happened. Tomorrow starts clean."}
            </DialogDescription>
          </DialogHeader>

          <button
            type="button"
            onClick={() => setShowReflection(false)}
            className="h-11 cursor-pointer rounded-full bg-chrome text-md font-normal text-chrome-ink"
          >
            Close
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
