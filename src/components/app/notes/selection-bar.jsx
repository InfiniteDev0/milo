"use client";

// Appears once a note is ticked: move the ticked notes to a block or to the day, or delete them.

import { FolderInput, Trash2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBlocks } from "../blocks-provider";

export function SelectionBar({ count, onMove, onDelete, onClear }) {
  const { blocks, droppedToday } = useBlocks();
  if (count === 0) return null;

  // blocks set aside today still take notes
  const choices = [...blocks, ...droppedToday];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-chrome px-3 py-2 text-sm text-chrome-ink">
      <span className="px-1 tabular-nums">{count} selected</span>

      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-chip px-3 text-xs text-chip-ink hover:bg-chip/85"
            >
              <FolderInput className="size-3.5" />
              Move to
            </button>
          }
        />
        <PopoverContent align="start" sideOffset={8} className="w-56 p-2">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onMove(null)}
              className="cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-foreground/5"
            >
              Day note
            </button>
            {choices.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onMove(b)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-foreground/5"
              >
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.bg }} />
                {b.name.replace(" Block", "")}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <button
        type="button"
        onClick={onDelete}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs text-chrome-ink/70 transition-colors hover:bg-chrome-ink/10 hover:text-chrome-ink"
      >
        <Trash2 className="size-3.5" />
        Delete
      </button>

      <button
        type="button"
        onClick={onClear}
        aria-label="Clear selection"
        className="ml-auto flex size-8 cursor-pointer items-center justify-center rounded-lg text-chrome-ink/50 transition-colors hover:bg-chrome-ink/10 hover:text-chrome-ink"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
