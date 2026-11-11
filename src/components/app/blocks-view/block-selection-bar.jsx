"use client";

// Shows once a block is ticked: how many, then Archive (off the board, back any time from Archived)
// and Delete (to Trash, with their tasks), and × to let go. With exactly one ticked, Rename and
// Colour too — the block sheet that used to hold them is gone. It replaced the ⋯ menu on each box.

import { useState } from "react";
import { Archive, Palette, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BLOCK_COLOURS } from "@/lib/block-colours";
import { cn } from "@/lib/utils";
import { BOX } from "../view-header";
import { useBlocks } from "../blocks-provider";

export function BlockSelectionBar({ selected, onClear }) {
  const { blocks, archiveBlock, removeBlock, editBlock } = useBlocks();
  // the new name, while it's typed
  const [naming, setNaming] = useState(null);
  if (selected.size === 0) return null;
  const picked = blocks.filter((b) => selected.has(b.id));
  const one = picked.length === 1 ? picked[0] : null;
  const name = one ? one.name.replace(" Block", "") : `${picked.length} blocks`;

  const rename = () => {
    const next = naming?.trim();
    if (one && next && next !== one.name) editBlock(one.id, { name: next });
    setNaming(null);
  };

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border px-5 py-2 text-sm">
      <span className="px-1 tabular-nums">{picked.length} selected</span>

      {/* one block: its name and its colour */}
      {one &&
        (naming != null ? (
          <input
            autoFocus
            value={naming}
            onChange={(e) => setNaming(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") rename();
              if (e.key === "Escape") setNaming(null);
            }}
            onBlur={rename}
            aria-label="Block name"
            className="h-8 w-48 rounded-sm bg-background px-2.5 text-sm outline-none ring-1 ring-(--theme-accent)"
          />
        ) : (
          <button type="button" onClick={() => setNaming(one.name)} className={cn(BOX, "cursor-pointer gap-1.5 transition-colors hover:bg-muted")}>
            <Pencil className="size-3.5" />
            Rename
          </button>
        ))}
      {one && (
        <Popover>
          <PopoverTrigger className={cn(BOX, "cursor-pointer gap-1.5 transition-colors hover:bg-muted")}>
            <Palette className="size-3.5" />
            Colour
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={6} className="grid w-auto grid-cols-5 gap-1.5 rounded-sm p-2.5">
            {BLOCK_COLOURS.map((c) => (
              <button
                key={c.bg}
                type="button"
                onClick={() => editBlock(one.id, { bg: c.bg, ink: c.ink })}
                aria-label={`Colour ${c.bg}`}
                className={cn(
                  "size-7 cursor-pointer rounded-sm transition-transform hover:scale-110",
                  one.bg.toLowerCase() === c.bg.toLowerCase() && "ring-2 ring-foreground/50 ring-offset-2 ring-offset-popover",
                )}
                style={{ background: c.bg }}
              />
            ))}
          </PopoverContent>
        </Popover>
      )}

      <button
        type="button"
        onClick={() => {
          picked.forEach((b) => archiveBlock(b.id));
          toast(`${name} archived`, { description: "Bring them back any time from Archived, in the bar." });
          onClear();
        }}
        className={cn(BOX, "cursor-pointer gap-1.5 transition-colors hover:bg-muted")}
      >
        <Archive className="size-3.5" />
        Archive
      </button>
      <button
        type="button"
        onClick={() => {
          picked.forEach((b) => removeBlock(b.id));
          toast(`${name} moved to Trash`, { description: "Their tasks went with them. Restore any time from Trash." });
          onClear();
        }}
        className={cn(BOX, "cursor-pointer gap-1.5 text-[#ef4444] transition-colors hover:bg-[#ef4444]/10")}
      >
        <Trash2 className="size-3.5" />
        Delete
      </button>
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear selection"
        className="ms-auto flex size-8 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
