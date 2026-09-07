"use client";

/* Today's blocks, lined up. The same line every day — the shape of your day,
 * visible before you've done anything with it.
 *
 * Drag one down into the centre to start it. It becomes the first in the line,
 * so the lineup ends up ordered by the way the day actually went rather than
 * by a plan you made in advance. Tapping works too.
 */

import { useState } from "react";
import { shade } from "@/lib/shade";
import { spent, useNow } from "@/lib/time";
import { useBlocks } from "./blocks-provider";
import { DropZone } from "./drop-zone";
import { TaskRings } from "./task-rings";
import { Button } from "../ui/button";

/* "Not today" is off for now. The gesture, the drop zone and the set-aside
   chip are all still here and still wired to the provider — flip this back
   to true and they return. Kept as a switch rather than deleted because the
   decision was to hold it, not to drop the idea. */
const DROP_ENABLED = false;

/* Held while localStorage is read. Same height and spacing as the real
   lineup, and grey rather than coloured — a coloured placeholder would read
   as a block you have and then turn into a different one. */
function LineupSkeleton() {
  return (
    <div className="flex w-full animate-pulse gap-3 pb-1">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="h-16 min-w-56 flex-1 rounded-xl bg-black/[0.04]"
        />
      ))}
    </div>
  );
}

export function BlockLineup() {
  const { blocks, countsFor, start, reorderBlocks, focusLocked, droppedToday, undropBlock, hydrated, spentOnBlock } =
    useBlocks();
  const [draggingId, setDraggingId] = useState(null);
  const [showDropped, setShowDropped] = useState(false);
  const [over, setOver] = useState(null);

  /* Above the early returns, and it has to stay there: the skeleton path
     below returns before this line, so calling the hook after it means one
     render uses four hooks and the next uses five. React counts them by
     position, so that is a crash, not a warning. */
  const now = useNow(blocks.some((b) => b.status === "ongoing"));

  // seed blocks would flash before the real ones arrive
  if (!hydrated) return <LineupSkeleton />;

  if (blocks.length === 0) {
    return (
      <div className="flex h-16 w-full items-center rounded-xl border border-dashed border-black/10 px-4 text-sm text-black/35">
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
  const ordered =
    focusLocked && running.length > 0
      ? running
      : blocks.filter((b) => b.status !== "done");

  return (
    /* pb-2 leaves room for the 4px shadow AND the 4px the card travels when
       pressed. overflow-y-hidden is the other half: `overflow-x-auto` makes
       overflow-y compute to auto as well, so without it the press pushed the
       card 4px past the bottom and a vertical scrollbar appeared mid-click. */
    <div className="flex w-full gap-3 overflow-x-auto overflow-y-hidden pb-2">
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
            onClick={() => start(b.id)}
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
              over === b.id ? "scale-[0.97] ring-2 ring-black/40" : ""
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

      {/* One quiet chip, not N faded cards — the whole point of dropping is
          that they stop asking for you. */}
      {DROP_ENABLED && droppedToday.length > 0 && !focusLocked && (
        <div className="relative flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => setShowDropped((v) => !v)}
            className="h-16 cursor-pointer rounded-xl border border-dashed border-black/15 px-4 text-xs text-black/40 transition-colors hover:border-black/30 hover:text-black/70"
          >
            {droppedToday.length} set aside
          </button>

          {showDropped && (
            <div className="absolute left-0 top-[72px] z-30 flex w-56 flex-col gap-1.5 rounded-xl bg-white p-2 shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
              {droppedToday.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    undropBlock(b.id);
                    setShowDropped(false);
                  }}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs"
                  style={{ background: b.bg, color: b.ink }}
                >
                  <span className="truncate">{b.name.replace(" Block", "")}</span>
                  <span className="shrink-0 opacity-60">bring back</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {DROP_ENABLED && (
        <DropZone draggingId={draggingId} onDone={() => setDraggingId(null)} />
      )}
    </div>
  );
}
