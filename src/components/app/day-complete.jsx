"use client";

/* The end of a day where every block got done.
 *
 * Three cards, and every one of them counts up. There is no "5 of 7" here and
 * no percentage: PRODUCT.md's rule is that reflection reports actuals, so the
 * numbers say what happened and there is nothing on this screen to compare
 * them against.
 *
 * Every number here is today's. A running lifetime total was tried in this slot
 * and cut: on a fresh account it reads 0, and a big zero under "things you've
 * shown up for" is exactly the sentence Milo exists to never say.
 *
 * The confetti fires once, in the colours of the blocks you actually did.
 */

import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { useBlocks } from "./blocks-provider";
import { sideCannons } from "./confetti";
import { spent } from "@/lib/time";

function Stat({ value, label }) {
  return (
    <div className="flex min-w-28 flex-col items-center gap-0.5 rounded-xl bg-foreground/[0.03] px-5 py-3">
      <span className="text-2xl font-medium tabular-nums">{value}</span>
      <span className="text-xs text-foreground/40">{label}</span>
    </div>
  );
}

export function DayComplete({ finished }) {
  const { summary, spentToday } = useBlocks();

  /* Real elapsed time, not the sum of the estimates. The old figure added up
     each done task's `minutes` and called it 'in them', which was the
     estimate wearing the label of the actual — and people underestimate their
     own tasks as a rule, so it was reliably wrong and reliably flattering. */
  const elapsed = spent(spentToday(Date.now()));

  /* Once. Re-firing it every time this re-renders would turn the one loud
     moment in the app into a thing that happens at you. */
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    sideCannons(finished.map((b) => b.bg));
  }, [finished]);

  return (
    <>
      <img
        src="/motiv.svg"
        alt=""
        className="dark:rounded-2xl dark:bg-chip dark:p-1 size-44"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />

      <p className="text-sm text-foreground/70">
        That&rsquo;s the day.{" "}
        <span className="text-foreground/45">Every block you kept, done.</span>
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <Stat value={summary.blocksDone} label="blocks" />
        <Stat value={summary.done} label="things you did" />
        {/* Only shown once there is something to show. A day with no clock
            time gets two cards, not a "0m" — same rule as a block with no
            time recorded. */}
        {elapsed && <Stat value={elapsed} label="spent" />}
      </div>

      {/* Says out loud what the reset does, so closing the day never feels
          like it might cost something. */}
      <p className="max-w-xs pt-1 text-xs text-foreground/30">
        Nothing carries over. Your blocks come back untouched in the morning.
      </p>

      {/* no fresh-day button: a new day starts at rollover, never on the same date */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <Button
          onClick={() => window.dispatchEvent(new Event("milo:close-day"))}
          style={{ "--lift": "var(--chrome-lift)" }}
          className="milo-lift cursor-pointer rounded-xl bg-chrome px-5 text-chrome-ink hover:bg-chrome-hover"
        >
          Look back on today
        </Button>
      </div>
    </>
  );
}
