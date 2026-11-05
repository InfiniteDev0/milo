"use client";

/* A day task's label: one of your categories (the same ones notes live in), so a
   category holds its notes and its tasks. "Select label" until one is picked,
   then its icon and name. The list has every category with its subcategories
   under it, No label, and New category to name one right there and pick it.
   Before migration 0016 there's nowhere to keep a label, and it says so. */

import { useState } from "react";
import { Check, FolderPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { dayTaskLabels } from "@/lib/db/day-tasks";
import { cn } from "@/lib/utils";
import { useCategories } from "../categories-provider";
import { PickedIcon } from "../icon-picker/picked-icon";
import { Tip } from "./tip";

const ROW = "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted";

// the label on a card, small, beside its name
export function LabelChip({ categoryId }) {
  const { list } = useCategories();
  const c = categoryId ? list.find((x) => x.id === categoryId) : null;
  if (!c) return null;
  return (
    <span className="mt-0.5 flex max-w-28 shrink-0 items-center gap-1 rounded-sm bg-foreground/[0.07] px-1.5 py-0.5 text-[11px] text-muted-foreground">
      <PickedIcon icon={c.icon} size={11} />
      <span className="truncate">{c.name || "Untitled"}</span>
    </span>
  );
}

export function LabelMenu({ value, onChange }) {
  const categories = useCategories();
  const [open, setOpen] = useState(false);
  // the new category's name, while it's typed
  const [naming, setNaming] = useState(null);
  const current = value ? categories.list.find((c) => c.id === value) : null;
  const tops = categories.list.filter((c) => !c.parentId);

  const pick = (id) => {
    onChange(id);
    setOpen(false);
    setNaming(null);
  };
  const create = () => {
    const name = naming?.trim();
    if (!name) return setNaming(null);
    const c = categories.addCategory({ name });
    if (c) pick(c.id);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // nowhere to keep a label until the database has the column
        if (next && !dayTaskLabels()) return toast("Labels switch on once migration 0016 is run in Supabase.");
        setOpen(next);
        if (!next) setNaming(null);
      }}
    >
      <Tip label={current ? "Label" : "Label it with a category"}>
        <PopoverTrigger
          onClick={(e) => e.stopPropagation()}
          className={cn("flex max-w-32 cursor-pointer items-center gap-1 transition-colors hover:text-[#2f80ed] data-popup-open:text-[#2f80ed]", current && "text-foreground")}
        >
          {current ? (
            <>
              <PickedIcon icon={current.icon} size={12} />
              <span className="truncate">{current.name || "Untitled"}</span>
            </>
          ) : (
            "Select label"
          )}
        </PopoverTrigger>
      </Tip>
      <PopoverContent align="start" sideOffset={6} onClick={(e) => e.stopPropagation()} className="max-h-80 w-60 gap-0.5 overflow-y-auto rounded-sm p-1.5">
        <span className="px-2.5 pt-1 pb-1.5 text-xs font-medium text-muted-foreground">Label</span>
        {current && (
          <button type="button" onClick={() => pick(null)} className={cn(ROW, "text-muted-foreground")}>
            <X className="size-3.5" />
            No label
          </button>
        )}
        {!categories.hydrated ? (
          <span className="px-2.5 py-1.5 text-sm text-muted-foreground">Loading your categories…</span>
        ) : categories.loadFailed ? (
          <span className="px-2.5 py-1.5 text-sm text-muted-foreground">Couldn&rsquo;t reach your categories.</span>
        ) : (
          tops.map((c) => (
            <div key={c.id} className="flex flex-col gap-0.5">
              <button type="button" onClick={() => pick(c.id)} className={ROW}>
                <PickedIcon icon={c.icon} size={14} />
                <span className="min-w-0 flex-1 truncate">{c.name || "Untitled"}</span>
                {value === c.id && <Check className="size-3.5" />}
              </button>
              {categories.list
                .filter((s) => s.parentId === c.id)
                .map((s) => (
                  <button key={s.id} type="button" onClick={() => pick(s.id)} className={cn(ROW, "ps-8 text-muted-foreground")}>
                    <span className="min-w-0 flex-1 truncate">{s.name || "Untitled"}</span>
                    {value === s.id && <Check className="size-3.5" />}
                  </button>
                ))}
            </div>
          ))
        )}
        {categories.canWrite &&
          (naming == null ? (
            <button type="button" onClick={() => setNaming("")} className={cn(ROW, "mt-0.5 border-t border-foreground/10 pt-2 text-muted-foreground")}>
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
              className="mx-1 mt-1 rounded-md bg-background px-2 py-1.5 text-sm outline-none ring-1 ring-[#2f80ed]"
            />
          ))}
      </PopoverContent>
    </Popover>
  );
}
