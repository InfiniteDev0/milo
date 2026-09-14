"use client";

/* What yesterday held, the next time you open Milo.
 *
 * This is the other half of a day ending on its own. Midnight files the day
 * whether or not you went through the closing screen — POSITIONING is explicit
 * that an unended day simply ends — and the cost of that is you never saw what
 * was in it. This is where you see it.
 *
 * IT IS NOT A PROMPT AND IT IS NOT A REMINDER. There is no "you forgot to
 * close yesterday", no streak, no offer to fix anything. Yesterday is over and
 * nothing here can be acted on; it is a sentence about something you did.
 *
 * It only ever appears for a day with something IN it. `summarise` files
 * nothing for a day where nothing finished, so a day you sat out has no entry
 * and this never opens — an empty day stays absent rather than arriving as a
 * zero the next morning.
 *
 * Dismissing marks the day ended. Reading what a day held IS closing it, one
 * day late, so there is no second "seen" flag anywhere.
 */

import MiloFace from "@/components/MiloFace";
import { spent } from "@/lib/time";
import { useBlocks } from "./blocks-provider";

export function MorningRecap() {
  const { unseen, markSeen, hydrated } = useBlocks();

  if (!hydrated || !unseen) return null;

  const blocks = unseen.blocks ?? [];
  const time = spent((unseen.minutes ?? 0) * 60000);

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 pr-24 pointer-events-none [&>*]:pointer-events-auto">
      <div className="flex items-center gap-3 rounded-2xl bg-chrome py-2 pl-2 pr-2 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip">
          {/* content, not proud. Milo is reporting, not congratulating — the
              same face it wears for a day with one block and a day with six. */}
          <MiloFace mood="content" instant gaze={false} reactToScroll={false} className="size-10" />
        </span>

        <div className="flex flex-col pr-1">
          <span className="text-sm text-chrome-ink">
            {unseen.label ?? "Yesterday"} —{" "}
            {blocks.length > 0 ? (
              <>
                {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
              </>
            ) : (
              <>
                {unseen.tasks} {unseen.tasks === 1 ? "thing" : "things"}
              </>
            )}
            {/* Only if there is one. A day under a minute reads as a day with
                no time recorded, exactly as TIME.md asks. */}
            {time && <span className="text-chrome-ink/45"> · {time}</span>}
          </span>

          {/* The blocks by name, in the order they finished. Actuals only —
              never "3 of 6", never a percentage, never a gap. */}
          {blocks.length > 0 && (
            <span className="truncate text-xs text-chrome-ink/45">
              {blocks.map((b) => b.name?.replace(" Block", "") ?? "A block").join(" · ")}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => markSeen(unseen.date)}
          className="ml-1 h-8 shrink-0 cursor-pointer rounded-lg bg-chrome-ink/10 px-3 text-xs text-chrome-ink/80 transition-colors hover:bg-chrome-ink/20"
        >
          ok
        </button>
      </div>
    </div>
  );
}
