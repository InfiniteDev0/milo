"use client";

// "Move to", the last tool on a card: into one of your blocks (it becomes that
// block's task, in the Blocks view), or onto a day picked from the calendar.
// A block's own task passes no onMoveToDay and its own block as fromBlock:
// it gets the other blocks only.

import { useState } from "react";
import { ArrowRightToLine } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useBlocks } from "../blocks-provider";
import { Tip } from "./tip";

const LABEL = "px-2.5 pb-1 pt-2 text-xs text-muted-foreground";

export function MoveMenu({ origin, fromBlock, onMoveToBlock, onMoveToDay, className }) {
  const [open, setOpen] = useState(false);
  const { blocks: all } = useBlocks();
  const blocks = all.filter((b) => b.id !== fromBlock);
  const year = (origin ?? new Date()).getFullYear();

  const pick = (run) => (value) => {
    setOpen(false);
    run(value);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tip label="Move to">
        <PopoverTrigger
          aria-label="Move to"
          onClick={(e) => e.stopPropagation()}
          className={cn("cursor-pointer transition-colors hover:text-[#2f80ed]", open && "text-[#2f80ed]", className)}
        >
          <ArrowRightToLine className="size-3.5" />
        </PopoverTrigger>
      </Tip>
      <PopoverContent
        align="start"
        sideOffset={8}
        onClick={(e) => e.stopPropagation()}
        className="w-64 gap-0 rounded-lg border border-foreground/10 bg-card p-1.5 ring-0"
      >
        <p className={LABEL}>Move to a block</p>
        {blocks.length ? (
          blocks.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => pick(onMoveToBlock)(b.id)}
              className="flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-sm px-2.5 text-left text-sm hover:bg-muted"
            >
              <span className="size-3 shrink-0 rounded-sm" style={{ background: b.bg }} />
              <span className="truncate">{b.name.replace(" Block", "")}</span>
            </button>
          ))
        ) : (
          <p className="px-2.5 py-2 text-sm text-muted-foreground">{fromBlock ? "No other blocks." : "No blocks yet."}</p>
        )}

        {onMoveToDay && (
          <>
        <div className="mx-2.5 my-1.5 h-px bg-foreground/10" />
        <p className={LABEL}>Move to a day</p>
        {/* this year only: the Tasks view runs 1 January to 31 December */}
        <Calendar
          mode="single"
          selected={origin}
          defaultMonth={origin}
          startMonth={new Date(year, 0)}
          endMonth={new Date(year, 11)}
          disabled={(d) => d.getFullYear() !== year || d.toDateString() === origin.toDateString()}
          onSelect={(d) => d && pick(onMoveToDay)(d)}
          className="mx-auto bg-transparent"
        />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
