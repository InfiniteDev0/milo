"use client";

// Shows once a block is ticked: how many, then Archive (off the board, back any time from Archived)
// and Delete (to Trash, with their tasks), and × to let go. It replaced the ⋯ menu on each box.

import { Archive, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BOX } from "../view-header";
import { useBlocks } from "../blocks-provider";

export function BlockSelectionBar({ selected, onClear }) {
  const { blocks, archiveBlock, removeBlock } = useBlocks();
  if (selected.size === 0) return null;
  const picked = blocks.filter((b) => selected.has(b.id));
  const one = picked.length === 1;
  const name = one ? picked[0].name.replace(" Block", "") : `${picked.length} blocks`;

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border px-5 py-2 text-sm">
      <span className="px-1 tabular-nums">{picked.length} selected</span>
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
