"use client";

/* The block, as its box has always looked: its colour, its name, what it holds
   (or how long it's been running), its rings, and the lift under it. The same
   inside as the old lineup's boxes, so the two can't drift apart.

   Hover it for the tick at its top left: tick blocks to archive or delete them
   from the bar above (it replaced a hard-to-see ⋯ menu). Press and carry it onto the board and let go: it goes first in line
   and starts — the quick way to switch. While it runs, the
   pause button sits on it; with one block running, the others recede. */

import { Pause } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { shade } from "@/lib/shade";
import { spent } from "@/lib/time";
import { useBlocks } from "../blocks-provider";
import { BlockInside } from "../block-lineup";
import { SelectBox } from "../notes/select-box";

// selected: ticked; selecting: some block is, so every tick stays showing
export function BlockBox({ block, now, anyRunning, selected = false, selecting = false, onToggleSelect }) {
  const { countsFor, spentOnBlock, start } = useBlocks();
  // carried, it's a block to start, not a task to move; a plain click still opens it
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: `block:${block.id}`,
    data: { type: "block", block },
  });
  const counts = countsFor(block.id);
  const total = counts.todo + counts.doing + counts.done;
  const ongoing = block.status === "ongoing";
  const receding = anyRunning && !ongoing;
  const sub = ongoing
    ? (spent(spentOnBlock(block.id, now)) ?? "Running")
    : total === 0
      ? "Nothing in it"
      : `${total} ${total === 1 ? "task" : "tasks"}`;

  return (
    // with another block running this one recedes — not by fading the whole box, which left
    // its text unreadable, but by washing its colour into the page and using the page's own
    // text colour, so it stays legible in either theme
    <div className="group/box relative flex">
      <button
        ref={setNodeRef}
        data-block-box
        {...attributes}
        {...listeners}
        type="button"
        title={block.name}
        className={`milo-lift flex h-16 w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl px-4 text-left ${
          isDragging ? "opacity-40" : ""
        }`}
        style={
          receding
            ? {
                background: `color-mix(in srgb, ${block.bg} 38%, var(--card))`,
                color: "color-mix(in srgb, var(--foreground) 75%, transparent)",
                "--lift": `color-mix(in srgb, ${block.bg} 38%, black)`,
              }
            : {
                background: block.bg,
                color: block.ink,
                // deeper under the block that's running, so it sits proudest
                "--lift": shade(block.bg, ongoing ? 0.3 : 0.22),
              }
        }
      >
        <BlockInside name={block.name} sub={sub} counts={counts} reserve={ongoing} />
      </button>

      {/* the tick, top left: on hover, or always once any block is ticked */}
      {onToggleSelect && (
        <span
          onPointerDown={(e) => e.stopPropagation()}
          className={`absolute top-2 left-2 transition-opacity ${selected || selecting ? "opacity-100" : "opacity-0 group-hover/box:opacity-100 focus-within:opacity-100"}`}
        >
          <SelectBox checked={selected} onToggle={() => onToggleSelect(block.id)} className="size-4 rounded-[5px] shadow-sm" />
        </span>
      )}

      {/* stop the running block */}
      {ongoing && (
        <button
          type="button"
          onClick={() => start(block.id)}
          aria-label={`Pause ${block.name.replace(" Block", "")}`}
          title="Pause this block"
          style={{ backgroundColor: block.ink, color: block.bg }}
          className="absolute top-1/2 right-16 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
        >
          <Pause className="size-3.5" fill="currentColor" />
        </button>
      )}
    </div>
  );
}
