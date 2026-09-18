"use client";

// A wish's quieter choices: shape it, set it down for this year, or delete it (with Undo).

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Undo } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ITEM =
  "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-foreground/5";

export function WishMenu({ onEdit, onSetDown, onDelete }) {
  const [open, setOpen] = useState(false);
  const pick = (fn) => () => {
    setOpen(false);
    fn();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="More"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg opacity-60 transition-opacity hover:bg-black/5 hover:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </button>
        }
      />
      <PopoverContent align="end" sideOffset={6} className="w-56 gap-0.5 p-1.5">
        <button type="button" onClick={pick(onEdit)} className={ITEM}>
          <Pencil className="size-4 opacity-60" />
          Edit and link blocks
        </button>
        {/* not a failure: a wish you decide isn't for this year */}
        <button type="button" onClick={pick(onSetDown)} className={ITEM}>
          <Undo className="size-4 opacity-60" />
          Set it down for now
        </button>
        <button type="button" onClick={pick(onDelete)} className={`${ITEM} text-foreground/60 hover:text-[#dc2626]`}>
          <Trash2 className="size-4 opacity-60" />
          Delete
        </button>
      </PopoverContent>
    </Popover>
  );
}
