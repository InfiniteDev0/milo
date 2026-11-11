"use client";

/* A day task's label: one of your categories (the same ones notes live in), so a
   category holds its notes and its tasks. "Select label" until one is picked,
   then its name, in its colour. The list has every category with its subcategories
   under it, No label, and New category to name one right there and pick it.
   Before migration 0016 there's nowhere to keep a label, and it says so. */

import { useState } from "react";
import { Check, FolderPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { checkLabels, dayTaskLabels } from "@/lib/db/day-tasks";
import { checkColors } from "@/lib/db/categories";
import { cn } from "@/lib/utils";
import { useCategories } from "../categories-provider";
import { Tip } from "./tip";
import { markStep } from "../whats-new/steps";

const ROW = "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted";

// a label's colour: the one picked for its category, or else one of eight from its id, so it's
// always the same one
const COLOURS = ["#2f80ed", "#00b86b", "#9a6dd7", "#e07c39", "#e255a1", "#06b6d4", "#dfab01", "#e5534b"];
export function labelColour(category) {
  if (category.color) return category.color;
  let h = 0;
  for (const ch of category.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COLOURS[h % COLOURS.length];
}
// the chip's look in that colour: a soft fill, the colour itself for the words
const chipStyle = (category) => {
  const c = labelColour(category);
  return { background: `color-mix(in srgb, ${c} 18%, transparent)`, color: `color-mix(in srgb, ${c} 85%, var(--foreground))` };
};

// the colours to pick from, just above New category: the selected label's, ringed
function ColourRow({ category }) {
  const categories = useCategories();
  const now = labelColour(category);
  const pick = async (colour) => {
    if (!(await checkColors())) return toast("Label colours switch on once migration 0023 is run in Supabase.");
    categories.setColor(category.id, colour);
    markStep("label-colour");
  };
  return (
    <div className="mt-0.5 flex flex-col gap-1.5 border-t border-foreground/10 px-2.5 pt-2 pb-1">
      <span className="text-xs font-medium text-muted-foreground">Colour</span>
      <div className="flex items-center justify-between">
        {COLOURS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => pick(c)}
            aria-label={`Colour ${c}`}
            aria-pressed={now === c}
            style={{ background: c }}
            className={cn(
              "size-5 cursor-pointer rounded-full transition-transform hover:scale-110",
              now === c && "ring-2 ring-foreground/70 ring-offset-2 ring-offset-popover",
            )}
          />
        ))}
      </div>
    </div>
  );
}
const CHIP = "flex max-w-32 shrink-0 items-center rounded-sm px-1.5 py-0.5 text-[11px] font-medium";
// big: the size of a dialog's other choices (No time), for the New task dialog
const BIG = "flex h-8 max-w-56 shrink-0 items-center justify-center rounded-md px-3 text-sm leading-none font-medium";

// the label on a card, small, beside its name
export function LabelChip({ categoryId }) {
  const { list } = useCategories();
  const c = categoryId ? list.find((x) => x.id === categoryId) : null;
  if (!c) return null;
  return (
    <span className={CHIP} style={chipStyle(c)}>
      <span className="truncate">{c.name || "Untitled"}</span>
    </span>
  );
}

// the bar's Label filter: pick a category and every task without it fades; pick it again (or ×) to stop
export function LabelFilter({ value, onChange }) {
  const { list, hydrated, loadFailed } = useCategories();
  const [open, setOpen] = useState(false);
  const current = value ? list.find((c) => c.id === value) : null;
  if (!hydrated || loadFailed || list.length === 0) return null;
  return (
    <span className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "flex h-7 max-w-44 cursor-pointer items-center gap-1.5 truncate rounded-sm border px-2.5 text-[13px] transition-colors hover:bg-muted",
            current ? "border-transparent" : "border-foreground/20 text-muted-foreground dark:border-border",
          )}
          style={current ? chipStyle(current) : undefined}
        >
          {current ? current.name || "Untitled" : "Label"}
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={6} className="max-h-80 w-56 gap-0.5 overflow-y-auto rounded-sm p-1.5">
          <span className="px-2.5 pt-1 pb-1.5 text-xs font-medium text-muted-foreground">Show only a label</span>
          {list.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(value === c.id ? null : c.id);
                setOpen(false);
              }}
              className={cn(ROW, c.parentId && "ps-6")}
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: labelColour(c) }} />
              <span className="min-w-0 flex-1 truncate">{c.name || "Untitled"}</span>
              {value === c.id && <Check className="size-3.5" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
      {current && (
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Show every task"
          className="flex size-6 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </span>
  );
}

export function LabelMenu({ value, onChange, big = false }) {
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
        if (next && !dayTaskLabels()) {
          checkLabels().then((on) => (on ? setOpen(true) : toast("Labels switch on once migration 0016 is run in Supabase.")));
          return;
        }
        setOpen(next);
        if (!next) setNaming(null);
      }}
    >
      <Tip label={current ? "Label" : "Label it with a category"}>
        <PopoverTrigger
          data-tour="label-button"
          onClick={(e) => e.stopPropagation()}
          style={current ? chipStyle(current) : undefined}
          className={cn(
            "cursor-pointer transition-[color,opacity]",
            // Select label is blue from the start, not only under the pointer
            current
              ? cn(big ? BIG : CHIP, "hover:opacity-80")
              : big
                ? cn(BIG, "border border-(--theme-accent)/40 text-(--theme-accent) hover:bg-(--theme-accent)/10")
                : "flex items-center text-(--theme-accent) hover:opacity-80",
          )}
        >
          {current ? (
            <span className="truncate">{current.name || "Untitled"}</span>
          ) : (
            "Select label"
          )}
        </PopoverTrigger>
      </Tip>
      <PopoverContent align="start" sideOffset={6} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} className="max-h-80 w-60 gap-0.5 overflow-y-auto rounded-sm p-1.5">
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
        {/* the picked label's colour, just above New category */}
        {categories.canWrite && current && <ColourRow category={current} />}
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
              className="mx-1 mt-1 rounded-md bg-background px-2 py-1.5 text-sm outline-none ring-1 ring-(--theme-accent)"
            />
          ))}
      </PopoverContent>
    </Popover>
  );
}
