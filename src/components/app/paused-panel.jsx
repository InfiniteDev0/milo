"use client";

/* Where you were when you stopped.
 *
 * This takes the centre of the day page while the day is paused — the same
 * space the board and the nothing-running panel use, because a paused day has
 * no board to show and exactly one thing worth saying.
 *
 * THE TIME IS A CLOCK, NEVER A DURATION. "You paused at 2:40pm. It's 6:52 now."
 * — two readings, no subtraction. TIME.md rule 5: "you were away for 4h 12m" is
 * surveillance and a deficit in one line, and a number that grows while you are
 * not looking is a debt counter whichever way it is worded. Two clock readings
 * do the useful half — they tell you where you are in the day, which is real
 * work for anyone who loses the thread of an afternoon — without keeping score.
 *
 * The note is the reason this screen earns its space. Masicampo & Baumeister
 * (2011) — an unfinished task keeps intruding on your attention, and making a
 * specific plan for it stops the intrusion. Not finishing it. Writing down what
 * you'll do next. So this field is what lets you actually leave.
 */

import { useEffect, useRef } from "react";
import { useNow } from "@/lib/time";
import { useBlocks } from "./blocks-provider";

const clock = (ms) =>
  new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function PausedPanel() {
  const { pause, setPauseNote, resumeDay, blocks, tasks } = useBlocks();

  /* A minute is plenty: the reading is in minutes, so a faster tick would be
     the same picture more often. */
  const now = useNow(true, 60000);
  const box = useRef(null);

  /* Focused on arrival, because the note is worth most in the seconds right
     after you stop — while you still remember where you were. It stays
     optional: this puts the cursor there, it does not hold you. */
  useEffect(() => {
    box.current?.focus();
  }, []);

  if (!pause) return null;

  const block = blocks.find((b) => b.id === pause.blockId);
  const task = tasks.find((t) => t.id === pause.taskId);

  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-black/10 px-6 py-8">
      <img src="/relax.svg" alt="" className="size-44" />

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm text-black/70">
          You paused at {clock(pause.pausedAt)}.
          {now && <span className="text-black/45"> It&rsquo;s {clock(now)} now.</span>}
        </p>

        {/* Where you were. Absent rather than empty when you paused a day that
            had nothing running — there is no "no block" line to read. */}
        {block && (
          <p className="text-sm text-black/45">
            <span
              className="rounded-md px-1.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: block.bg, color: block.ink }}
            >
              {block.name.replace(" Block", "")}
            </span>
            {task && <span className="pl-2">{task.name}</span>}
          </p>
        )}
      </div>

      <textarea
        ref={box}
        value={pause.note ?? ""}
        onChange={(e) => setPauseNote(e.target.value)}
        rows={2}
        placeholder="What you'll pick up when you're back…"
        aria-label="A note to yourself for when you come back"
        className="w-full max-w-sm resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none placeholder:text-black/25 focus:border-black/30"
      />

      <button
        type="button"
        onClick={resumeDay}
        style={{ "--lift": "#1a1400" }}
        className="milo-lift cursor-pointer rounded-xl bg-[#F5C542] px-5 py-2.5 text-sm font-medium text-[#1a1400]"
      >
        Pick it back up
      </button>
    </div>
  );
}
