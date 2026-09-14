"use client";

/* Closing the day.
 *
 * Derived from the journal this app came out of. Four things in that account
 * decide the whole shape of this screen:
 *
 *   1. The night entry was never once written. "I measured success as doing a
 *      night entry, because I haven't done a night entry since I started."
 *      → So the close must work with ZERO input. Writing is offered, never
 *        required, and skipping it closes the day just as completely.
 *
 *   2. The day does not end when the blocks end. It ends hours later, after the
 *      scroll. The blocks finished — or didn't — long before.
 *      → So this is reachable at ANY moment, in any state. It is not gated on
 *        finishing anything. A day closed at three of five is a closed day.
 *
 *   3. The morning entry opens a loop the night entry closes. "In the morning I
 *      say what I want to do today; at night I reflect on what I did."
 *      → So this morning's words are shown back. Shown. Milo says nothing about
 *        them, does not compare them to what happened, and never scores them.
 *
 *   4. Success was measured as HAVING DONE the night entry — not as what got
 *      done that day.
 *      → So closing the day is worth doing at three of five, or one of five.
 *        The screen does not wait for a perfect day, because those are rare
 *        for everyone and rarer for the person in POSITIONING.
 *
 * NEVER PUNISH, NEVER FLATTER.
 *
 * The confetti used to fire on every close, including a day with nothing in
 * it. That was the app pretending, and a celebration that means the same for
 * five blocks and for none is one you stop hearing — which spends the real
 * ones too. So it keys off `happened`: something finished, or it didn't.
 *
 * Withholding it is not a reproach. There is still no mark, no count of what
 * was missed, no colour, and nothing carried into tomorrow. Milo simply does
 * not applaud an empty day, the same way it does not scold one.
 */

import { useEffect, useRef, useState } from "react";
import MiloFace from "@/components/MiloFace";
import { Button } from "@/components/ui/button";
import { spent } from "@/lib/time";
import { shade } from "@/lib/shade";
import { useBlocks } from "./blocks-provider";
import { sideCannons } from "./confetti";

export function CloseDay({ onClose }) {
  const {
    blocks,
    summary,
    spentToday,
    spentOnBlock,
    journal,
    setJournal,
    endDay,
  } = useBlocks();

  const [entry, setEntry] = useState(journal?.night ?? "");
  const now = Date.now();

  const finished = blocks
    .filter((b) => b.status === "done")
    .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0));

  const elapsed = spent(spentToday(now));

  /* Something happened, or it didn't. This is the line between the two, and
     everything on this screen keys off it.

     NEVER PUNISH, NEVER FLATTER. Confetti that fires for a day with nothing
     in it is not kindness — it is the app pretending, and a signal that means
     the same for five blocks and for none is a signal you stop hearing.
     Withholding it is not a reproach; it is the absence of a lie. */
  const happened = finished.length > 0 || summary.done > 0;

  const fired = useRef(false);
  useEffect(() => {
    if (fired.current || !happened) return;
    fired.current = true;
    sideCannons(finished.map((b) => b.bg));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ends the day, never resets it — a reset here overwrote today's row with an empty one
  const close = () => {
    setJournal({ ...journal, night: entry });
    endDay();
    onClose?.();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        {/* content, not happy, on a day with nothing in it. Milo is here
            either way — it just isn't pleased about nothing. */}
        <MiloFace
          mood={happened ? "happy" : "content"}
          instant
          gaze={false}
          reactToScroll={false}
          className="dark:rounded-[30%] dark:bg-chip size-20"
        />
        <h2 className="text-lg">
          {happened ? "That’s the day." : "Day closed."}
        </h2>
      </div>

      {/* ---- 1. what happened. Actuals, in the order they happened. ---- */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs tracking-wide text-foreground/35 uppercase">
          What happened
        </h3>

        {finished.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {finished.map((b) => (
              <div
                key={b.id}
                className="milo-lift flex items-center justify-between rounded-xl px-4 py-2.5 text-sm"
                style={{
                  background: b.bg,
                  color: b.ink,
                  "--lift": shade(b.bg, 0.22),
                }}
              >
                <span className="truncate">{b.name.replace(" Block", "")}</span>
                <span className="shrink-0 text-xs opacity-70 tabular-nums">
                  {spent(spentOnBlock(b.id, now))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Plain, and neither of the two things it must not be: no reproach,
             and no consolation prize. 'That counts too' was the app insisting
             on a silver lining nobody asked for — which is its own kind of not
             listening. Nothing happened. Milo says so and stops talking. */
          <p className="text-sm text-foreground/40">Nothing finished today.</p>
        )}

        {/* Counts up. Never "of", never a percentage, never a gap. */}
        <p className="pt-1 text-xs text-foreground/35 tabular-nums">
          {summary.done} {summary.done === 1 ? "thing" : "things"}
          {elapsed && ` · ${elapsed} spent`}
        </p>
      </section>

      {/* ---- 2. this morning, shown back. No comment, ever. ---- */}
      {journal?.morning?.trim() && (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs tracking-wide text-foreground/35 uppercase">
            This morning you said
          </h3>
          <p className="rounded-xl bg-foreground/[0.03] px-4 py-3 text-sm whitespace-pre-line text-foreground/70">
            {journal.morning}
          </p>
        </section>
      )}

      {/* ---- 3. tonight. Offered, never required. ---- */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs tracking-wide text-foreground/35 uppercase">
          Tonight
        </h3>
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          rows={4}
          placeholder="What you did, what you noticed. Or nothing."
          aria-label="Night entry"
          className="w-full resize-none rounded-xl border border-foreground/10 px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-foreground/25 focus:border-foreground/30"
        />
      </section>

      <Button
        type="button"
        onClick={close}
        className="milo-lift h-11 w-full rounded-xl border-0 bg-solid font-normal text-solid-ink hover:bg-solid-hover"
        style={{ "--lift": "var(--solid-lift)" }}
      >
        Close the day
      </Button>

      {/* Says what closing costs, which is nothing. */}
      <p className="-mt-3 text-center text-xs text-foreground/30">
        Your blocks come back untouched in the morning.
      </p>
    </div>
  );
}
