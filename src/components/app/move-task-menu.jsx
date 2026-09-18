"use client";

// Move a task into another block. Lists every block in your lineup, including ones set aside today.

import { useState } from "react";
import { Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBlocks } from "./blocks-provider";

export function MoveTaskMenu({ task, trigger, align = "end" }) {
  const { lineup, moveTask } = useBlocks();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent align={align} sideOffset={6} className="w-56 gap-0 p-1.5">
        <span className="px-2 pt-1 pb-1.5 text-xs text-foreground/45">Move to</span>
        {lineup.map((b) => {
          const here = b.id === task.blockId;
          return (
            <button
              key={b.id}
              type="button"
              disabled={here}
              onClick={(e) => {
                e.stopPropagation();
                moveTask(task.id, b.id);
                setOpen(false);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-foreground/5 disabled:cursor-default disabled:hover:bg-transparent"
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.bg }} />
              <span className={`min-w-0 flex-1 truncate ${here ? "text-foreground/45" : ""}`}>
                {b.name.replace(" Block", "")}
              </span>
              {here && <Check className="size-3.5 shrink-0 text-foreground/45" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
