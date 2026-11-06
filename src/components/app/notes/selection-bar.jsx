"use client";

// Appears once a note is ticked: select every note in view, move the ticked notes to a block, to
// the day or into a category (or a new one, named right there), or delete them.

import { useState } from "react";
import { CheckCheck, FolderInput, FolderPlus, Trash2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBlocks } from "../blocks-provider";
import { cn } from "@/lib/utils";

const CHOICE = "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-foreground/5";
const HEAD = "px-2.5 pt-1.5 pb-0.5 text-[11px] font-medium text-muted-foreground";

// total and onSelectAll are optional: given, the bar offers Select all until everything is ticked.
// categories and onFile are optional too: given, Move to lists them and can make a new one
export function SelectionBar({ count, total, onSelectAll, onMove, onDelete, onClear, categories, onFile }) {
  const { blocks, droppedToday } = useBlocks();
  const [open, setOpen] = useState(false);
  // the new category's name, while it's being typed
  const [naming, setNaming] = useState(null);
  if (count === 0) return null;

  const tops = categories?.list.filter((c) => !c.parentId) ?? [];
  const file = (c) => {
    onFile(c);
    setOpen(false);
  };
  const create = () => {
    const name = naming?.trim();
    if (!name) return setNaming(null);
    const c = categories.addCategory({ name });
    setNaming(null);
    if (c) file(c);
  };

  // blocks set aside today still take notes
  const choices = [...blocks, ...droppedToday];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-chrome px-3 py-2 text-sm text-chrome-ink">
      <span className="px-1 tabular-nums">{count} selected</span>

      {onSelectAll && count < total && (
        <button
          type="button"
          onClick={onSelectAll}
          className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs text-chrome-ink/80 transition-colors hover:bg-chrome-ink/10 hover:text-chrome-ink"
        >
          <CheckCheck className="size-3.5" />
          Select all {total}
        </button>
      )}

      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setNaming(null);
        }}
      >
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
        {/* Blocks and Categories side by side, a line between; just the blocks where there are no categories */}
        <PopoverContent
          align="start"
          sideOffset={8}
          className={cn("max-h-96 overflow-y-auto p-2", onFile ? "w-[30rem]" : "w-60")}
        >
          <div className={cn(onFile && "grid grid-cols-2 divide-x divide-foreground/10")}>
            <div className={cn("flex flex-col gap-1", onFile && "pe-2")}>
              {onFile && <span className={HEAD}>Blocks</span>}
              <button
                type="button"
                onClick={() => {
                  onMove(null);
                  setOpen(false);
                }}
                className="cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-foreground/5"
              >
                Day note
              </button>
              {choices.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onMove(b);
                    setOpen(false);
                  }}
                  className={CHOICE}
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.bg }} />
                  {b.name.replace(" Block", "")}
                </button>
              ))}
            </div>

            {onFile && (
              <div className="flex min-w-0 flex-col gap-1 ps-2">
                <span className={HEAD}>Categories</span>
                {/* out of any category */}
                <button type="button" onClick={() => file(null)} className={`${CHOICE} text-muted-foreground`}>
                  No category
                </button>
                {tops.map((c) => (
                  <div key={c.id} className="flex flex-col gap-1">
                    <button type="button" onClick={() => file(c)} className={CHOICE}>
                      <span className="truncate">{c.name || "Untitled"}</span>
                    </button>
                    {categories.list
                      .filter((s) => s.parentId === c.id)
                      .map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => file(s)}
                          className={`${CHOICE} ps-8 text-muted-foreground`}
                        >
                          <span className="truncate">{s.name || "Untitled"}</span>
                        </button>
                      ))}
                  </div>
                ))}
                {categories.canWrite &&
                  (naming == null ? (
                    <button type="button" onClick={() => setNaming("")} className={`${CHOICE} text-muted-foreground`}>
                      <FolderPlus className="size-3.5" />
                      New category
                    </button>
                  ) : (
                    <input
                      autoFocus
                      value={naming}
                      onChange={(e) => setNaming(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") create();
                        if (e.key === "Escape") setNaming(null);
                      }}
                      onBlur={create}
                      placeholder="Name it, then Enter"
                      aria-label="New category name"
                      className="mx-1 rounded-md bg-background px-2 py-1.5 text-xs outline-none ring-1 ring-[#2f80ed]"
                    />
                  ))}
              </div>
            )}
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
