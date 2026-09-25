"use client";

// A sheet's title that is also its switch: Day notes, or one block's notes.

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBlocks } from "../blocks-provider";

export const scopeName = (block) => (block ? block.name.replace(" Block", "") : "Day notes");

export function ScopePicker({ block, onPick }) {
  const { blocks, droppedToday } = useBlocks();
  // blocks set aside today still take notes
  const choices = [...blocks, ...droppedToday];
  const [open, setOpen] = useState(false);
  const pick = (scope) => {
    setOpen(false);
    onPick(scope);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`${scopeName(block)}, switch notes`}
            // its own box, so the title's clipping can't shave the pill's top and bottom
            className={`inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 align-middle transition-opacity hover:opacity-80 ${
              block ? "" : "bg-foreground/5"
            }`}
            style={block ? { backgroundColor: block.bg, color: block.ink } : undefined}
          >
            <span className="truncate">{scopeName(block)}</span>
            <ChevronDown className="size-4 shrink-0 opacity-60" />
          </button>
        }
      />
      <PopoverContent align="start" sideOffset={8} className="w-56 p-2">
        <div className="flex flex-col gap-1">
          <Choice active={!block} onClick={() => pick("day")}>
            <span className="size-2.5 shrink-0 rounded-full bg-foreground/20" />
            Day notes
          </Choice>
          {choices.map((b) => (
            <Choice key={b.id} active={block?.id === b.id} onClick={() => pick(b.id)}>
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.bg }} />
              {scopeName(b)}
            </Choice>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Choice({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-foreground/5 ${
        active ? "bg-foreground/5 font-medium" : ""
      }`}
    >
      {children}
    </button>
  );
}
