"use client";

/* Under a block's tasks for today: "Hidden tasks", when the block has tasks
   that aren't today's — set for other days, or set aside for today. It opens
   the way the cards' tools do, like an accordion. Each hidden task is a card:
   change its Days and it comes back, or drag it up into today's tasks and it's
   part of today straight away. Gone once nothing is hidden. */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = "duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]";

export function HiddenTasks({ count, children }) {
  const [open, setOpen] = useState(false);
  if (!count) return null;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-foreground/15 px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
      >
        <span className="flex-1 text-left">Hidden tasks</span>
        <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[11px] tabular-nums">{count}</span>
        <ChevronDown className={cn("size-4 transition-transform", EASE, open && "rotate-180")} />
      </button>

      <div className={cn("grid transition-[grid-template-rows,opacity]", EASE, open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="min-h-0 overflow-hidden">
          <div className={cn("flex flex-col gap-2 pt-2 transition-[translate,filter]", EASE, open ? "translate-y-0 blur-none" : "-translate-y-1.5 blur-[2px]")}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
