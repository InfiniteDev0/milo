"use client";

// What you can do to a whole block from the month: tuck it into the archive, or delete it for good.

import { Archive, MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBlocks } from "../blocks-provider";
import { DeleteBlock } from "../delete-block";

export function BlockMenu({ block }) {
  const { archiveBlock } = useBlocks();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`More for ${block.name}`}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg opacity-60 transition-opacity hover:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </button>
        }
      />
      <PopoverContent align="end" sideOffset={6} className="w-64 gap-1 p-2">
        {/* the reversible one first: a block in the archive comes back with one click */}
        <button
          type="button"
          onClick={() => archiveBlock(block.id)}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-foreground/5"
        >
          <Archive className="size-4 opacity-60" />
          Tuck into the archive
        </button>
        <DeleteBlock block={block} />
      </PopoverContent>
    </Popover>
  );
}
