"use client";

// "Make task recurring", from the repeat icon on a card — Sunsama's list, read
// against the day the task was written on. Blue once it repeats.

import { Check, Clock, Repeat } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { repeatOptions } from "@/lib/repeat";
import { cn } from "@/lib/utils";
import { Tip } from "./tip";

const ITEM = "h-9 cursor-pointer gap-2 rounded-sm px-2.5 text-[15px] focus:bg-muted";

export function RepeatMenu({ origin, value = "none", onChange, className }) {
  const on = value !== "none";

  return (
    <DropdownMenu>
      <Tip label={on ? "Repeats" : "Make it repeat"}>
        <DropdownMenuTrigger
          aria-label="Make task recurring"
          onClick={(e) => e.stopPropagation()}
          className={cn("cursor-pointer transition-colors hover:text-[#2f80ed]", on && "text-[#2f80ed]", className)}
        >
          <Repeat className="size-3.5" />
        </DropdownMenuTrigger>
      </Tip>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        onClick={(e) => e.stopPropagation()}
        className="w-80 rounded-sm border border-border bg-popover p-1.5 shadow-xl ring-0 dark:bg-[#161616]"
      >
        {/* a label has to sit in a group, or the menu throws when it opens */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2.5 pb-2 pt-1.5 text-sm font-normal text-muted-foreground">
            Make task recurring
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mx-2.5 my-1" />
        {repeatOptions(origin).map((o) => (
          <DropdownMenuItem key={o.id} className={ITEM} onClick={() => onChange(o.id)}>
            <span className="flex-1">
              {o.label}
              {o.hint && <span className="text-muted-foreground"> ({o.hint})</span>}
            </span>
            {value === o.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem disabled className={cn(ITEM, "text-foreground/40")}>
          <span className="flex-1">Custom…</span>
          <span className="rounded-sm bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Soon</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="mx-2.5 my-1" />
        <DropdownMenuItem disabled className={cn(ITEM, "text-foreground/40")}>
          <Clock className="size-4" />
          <span className="flex-1">Add time</span>
          <span className="rounded-sm bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Soon</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
