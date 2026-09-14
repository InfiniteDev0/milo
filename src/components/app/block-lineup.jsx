"use client";

/* Today's blocks, lined up. The same line every day — the shape of your day,
 * visible before you've done anything with it.
 *
 * Drag one down into the centre to start it. It becomes the first in the line,
 * so the lineup ends up ordered by the way the day actually went rather than
 * by a plan you made in advance. Tapping works too.
 */

import { useEffect, useState } from "react";
import { shade } from "@/lib/shade";
import { spent, useNow } from "@/lib/time";
import MiloFace from "@/components/MiloFace";
import { useBlocks } from "./blocks-provider";
import { DropZone } from "./drop-zone";
import { TaskRings } from "./task-rings";
import { RestPill } from "./rest-pill";
import { Button } from "../ui/button";

/* "Not today" is off for now. The gesture, the drop zone and the set-aside
   chip are all still here and still wired to the provider — flip this back
   to true and they return. Kept as a switch rather than deleted because the
   decision was to hold it, not to drop the idea. */
const DROP_ENABLED = true;

/* Held while localStorage is read. Same height and spacing as the real
   lineup, and grey rather than coloured — a coloured placeholder would read
   as a block you have and then turn into a different one. */
function LineupSkeleton() {
  return (
    <div className="flex w-full animate-pulse gap-3 pb-1">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="h-16 min-w-56 flex-1 rounded-xl bg-foreground/[0.04]"
        />
      ))}
    </div>
  );
}

export function BlockLineup() {
  const { blocks, countsFor, start, reorderBlocks, focusLocked, hydrated, spentOnBlock, paused, pause, loadFailed, retry, rest } =
    useBlocks();
  const [draggingId, setDraggingId] = useState(null);
  const [over, setOver] = useState(null);

  /* Above the early returns, and it has to stay there: the skeleton path
     below returns before this line, so calling the hook after it means one
     render uses four hooks and the next uses five. React counts them by
     position, so that is a crash, not a warning. */
  const now = useNow(blocks.some((b) => b.status === "ongoing"));

  // seed blocks would flash before the real ones arrive
  if (!hydrated) return <LineupSkeleton />;

  /* COULDN'T READ ≠ NOTHING THERE.

     This has to come first, and it is the more important of the two. An
     empty state ASSERTS something — 'you have no blocks' — and when the read
     failed we do not know that. Saying it anyway tells someone with a month
     of work behind them that their day is gone, which is the single worst
     sentence this app could put on a screen.

     So when we don't know, we say we don't know, and we offer to look
     again. */
  if (loadFailed) {
    return (
      <div className="flex h-16 w-full items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-4 text-sm">
        <span className="text-foreground/50">
          Couldn&rsquo;t reach your blocks.
          <span className="text-foreground/35"> Nothing is lost — they&rsquo;re still saved.</span>
        </span>
        <button
          type="button"
          onClick={retry}
          className="ml-auto shrink-0 cursor-pointer rounded-lg bg-foreground px-3 py-1.5 text-xs text-background"
        >
          Try again
        </button>
      </div>
    );
  }

  /* Rest takes the whole row until you skip it. Nothing here can be started
     while it runs, so a lineup of blocks would only be asking. */
  if (rest) return <RestPill />;

  if (blocks.length === 0) {
    return (
      <div className="flex h-16 w-full items-center rounded-xl border border-dashed border-foreground/10 px-4 text-sm text-foreground/35">
        No blocks yet. Add them from the Month view.
      </div>
    );
  }

  /* Locked: the running block, alone. Everything else waits out of sight
     until this one is done. */
  const running = blocks.filter((b) => b.status === "ongoing");
  /* Finished blocks leave the line entirely. The lineup is what's still
     in front of you; what you already did lives in the centre, where it
     gets a whole panel to itself instead of a crossed-out card. */
  // the running block always leads the line; sort is stable, so the rest keep their order
  const ordered = [
    ...(focusLocked && running.length > 0
      ? running
      : blocks.filter((b) => b.status !== "done")),
  ].sort((a, b) => (b.status === "ongoing") - (a.status === "ongoing"));

  /* Nothing left in the line — at the end of a day every block has moved to
     the done row, so this renders nothing and the board takes the space.
     Paused still shows: its overlay lives in the wrapper below. */
  if (ordered.length === 0 && !paused) return null;

  return (
    /* The wrapper exists for the badge. It has to sit OUTSIDE the scroller —
       inside, it would scroll away with the blocks and stop being centred the
       moment you nudged the strip sideways. */
    <div className="relative flex w-full items-start gap-3">
      {paused && (
        /* The day is asleep, said the way the rest pill in day-bar.jsx says it:
           black pill, white disc, Milo's face in the disc. Same shape because
           it is the same kind of message — the app is quiet on purpose.

           It reports; it is not a button. There is exactly one door back and
           it is the panel below, which can also say where you were. Two
           buttons doing one thing is how you end up reading both. */
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center pb-2">
          <span className="flex items-center gap-2.5 rounded-full bg-chrome py-1.5 pl-1.5 pr-5 shadow-[0_6px_24px_rgba(0,0,0,0.25)]">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-chip">
              <MiloFace mood="sleepy" instant gaze={false} reactToScroll={false} className="size-8" />
            </span>
            <span className="text-sm text-chrome-ink">
              Day paused
              {pause?.pausedAt && (
                <span className="text-chrome-ink/45">
                  {" · "}
                  {new Date(pause.pausedAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </span>
          </span>
        </div>
      )}

    {/* pb-2 leaves room for the 4px shadow AND the 4px the card travels when
       pressed. overflow-y-hidden is the other half: `overflow-x-auto` makes
       overflow-y compute to auto as well, so without it the press pushed the
       card 4px past the bottom and a vertical scrollbar appeared mid-click.

       Blurred while paused, and inert with it: a block you cannot read is a
       block you should not be able to drag. Nothing is refused — pick the day
       back up and every block is there, including a different one. */}
    <div
      className={`flex min-w-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden scrollbar-pill pb-2 transition-all duration-300 ${
        paused ? "pointer-events-none select-none blur-[3px] opacity-60" : ""
      }`}
    >
      {ordered.map((b) => {
        const counts = countsFor(b.id);
        const total = counts.todo + counts.doing + counts.done;
        const ongoing = b.status === "ongoing";

        /* With something running, only that block keeps its full colour.
           The others stay legible but recede — you can see the shape of
           the day without it asking anything of you. */
        const opacity =
          ongoing || running.length === 0 ? "opacity-100" : "opacity-45";

        return (
          <Button 
            key={b.id}
            type="button"
            /* OPENS IT. Starting is the drag — which is what the empty
               state under the board has always said: "Drag a block down
               here to start it." Click was quietly starting it too, so
               there was no way to look inside a block without committing
               to it, and the copy was describing a gesture nobody needed.

               Now the two are separate: drag to commit, click to look.
               The sheet's own button starts it, so clicking is never a
               dead end — one extra tap, and you get to see what you are
               agreeing to first. */
            onClick={() =>
              window.dispatchEvent(new CustomEvent("milo:open-block", { detail: b.id }))
            }
            draggable
            onDragOver={(e) => {
              if (!e.dataTransfer.types.includes("application/milo-block")) return;
              e.preventDefault();
              setOver(b.id);
            }}
            onDragLeave={() => setOver((o) => (o === b.id ? null : o))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("application/milo-block");
              setOver(null);
              if (id) reorderBlocks(id, b.id);
            }}
            onDragEnd={() => { setOver(null); setDraggingId(null); }}
            onDragStart={(e) => {
              setDraggingId(b.id);
              e.dataTransfer.setData("application/milo-block", b.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            title={b.name}
            /* milo-lift owns the transition, so `transition-all` is gone:
               two authorities on the same property meant the press either
               animated over 300ms or not at all. */
            className={`milo-lift flex h-16 min-w-56 flex-1 cursor-grab items-center justify-between gap-3 rounded-xl px-4 text-left active:cursor-grabbing ${opacity} ${
              over === b.id ? "scale-[0.97] ring-2 ring-foreground/40" : ""
            }`}
            style={{
              background: b.bg,
              color: b.ink,
              // deeper under the block that's running, so it sits proudest
              "--lift": shade(b.bg, ongoing ? 0.3 : 0.22),
            }}
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {b.name.replace(" Block", "")}
              </span>
              <span className="text-xs opacity-60">
                {ongoing
                  ? /* Counting up, and only while it runs. `spent` returns
                       null under a minute, so a block that just started
                       says Running rather than 0m. */
                    (spent(spentOnBlock(b.id, now)) ?? "Running")
                  : total === 0
                    ? "Nothing in it"
                    : `${total} ${total === 1 ? "task" : "tasks"}`}
              </span>
            </div>
            <TaskRings {...counts} className="size-9 shrink-0" />
          </Button>
        );
      })}

      {DROP_ENABLED && (
        <DropZone draggingId={draggingId} onDone={() => setDraggingId(null)} />
      )}
    </div>
    </div>
  );
}
