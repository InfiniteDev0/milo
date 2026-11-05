"use client";

// "Days", first on a block card's tool row: which weekdays the task shows up on,
// and whether it comes back or happens once — the task sheet's own Schedule, in
// a panel by the card. A black button with white text in both themes.

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DAYS } from "@/lib/days";
import { Schedule } from "../task-sheet/schedule";
import { Tip } from "../tasks-view/tip";


export function DaysMenu({ task }) {
  const [open, setOpen] = useState(false);
  const days = task.days ?? [];
  const set = days.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tip label={set ? DAYS.filter((d) => days.includes(d.id)).map((d) => d.name.slice(0, 3)).join(", ") : "Which days it shows up"}>
        <PopoverTrigger
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "cursor-pointer rounded-sm bg-black px-1.5 py-0.5 text-[11px] font-medium text-white transition-opacity hover:opacity-85",
            open && "opacity-85",
          )}
        >
          Days
        </PopoverTrigger>
      </Tip>
      <PopoverContent
        align="start"
        sideOffset={8}
        onClick={(e) => e.stopPropagation()}
        className="w-80 rounded-lg border border-foreground/10 bg-card p-3 ring-0 [&>div]:border-t-0 [&>div]:pt-0"
      >
        <Schedule task={task} />
      </PopoverContent>
    </Popover>
  );
}
