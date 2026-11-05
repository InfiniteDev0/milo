"use client";

/* The Notes page's left section. A search, then Notes with its count, then the
   tree, and at the bottom — where a theme toggle would sit — Notes | Reminders.
   The tree follows the top tabs:

     By block       your blocks, each with its notes count; pick one to see only its notes
     anything else  your categories and their subcategories (samples for now: the user
                    will say how they work) */

import { NotebookPen, Search } from "lucide-react";
import { UserGroup } from "../icons/user-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { cn } from "@/lib/utils";
import { useBlocks } from "../blocks-provider";
import { COUNT } from "../view-header";
import { Categories } from "./categories";
import { BlockTree } from "./block-tree";

const ITEM = "flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm transition-colors";

// showBlocks: the By block tab is on. section: "notes" or "reminders", the bottom tabs.
// categories: from useCategories; category: the one picked, shown on the right
export function SidePanel({
  notes,
  showBlocks,
  section,
  onSection,
  query,
  onQuery,
  place,
  onPlace,
  categories,
  category,
  onCategory,
  onCategoryAdd,
  onOpenNote,
  shared,
  onShared,
}) {
  const { blocks, droppedToday, archived } = useBlocks();
  const all = [...blocks, ...droppedToday, ...archived];
  const known = new Set(all.map((b) => b.id));
  const shelved = archived.filter((b) => notes.some((n) => n.blockId === b.id));

  return (
    <aside className="flex w-[17rem] shrink-0 flex-col gap-4 border-r border-border px-3 pb-3 pt-3">
      <label className="flex h-9 shrink-0 items-center gap-2 rounded-sm border border-foreground/20 bg-card px-2.5 dark:border-border">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search…"
          aria-label="Search notes"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      {/* Reminders shows none of the notes side yet: only the search and the tabs */}
      {section === "reminders" ? (
        <div className="flex-1" />
      ) : (
        <>
          {/* every note: the way back from a block or a category */}
          <button
            type="button"
            onClick={() => {
              onPlace(null);
              onCategory(null);
            }}
            className={cn(
              ITEM,
              place == null && !category && !shared
                ? "bg-[#2f80ed]/10 font-medium text-[#2f80ed]"
                : "text-foreground/80 hover:bg-foreground/[0.04]",
            )}
          >
            <NotebookPen className="size-4 shrink-0" />
            <span className="flex-1">Notes</span>
            <span className={COUNT}>{notes.length}</span>
          </button>

          {/* notes shared with others: a blank page for now */}
          <button
            type="button"
            onClick={onShared}
            className={cn(ITEM, "-mt-3", shared ? "bg-[#2f80ed]/10 font-medium text-[#2f80ed]" : "text-foreground/80 hover:bg-foreground/[0.04]")}
          >
            <UserGroup className="size-4 shrink-0" />
            <span className="flex-1">Shared</span>
            {/* nothing can be shared yet */}
            <span className={COUNT}>0</span>
          </button>

          {/* your notes above, the tree below */}
          <div className="h-px shrink-0 bg-border" />

          <div className="scrollbar-pill -mx-1 min-h-0 flex-1 overflow-y-auto px-1">
            {showBlocks ? (
              <BlockTree
                rows={[
                  ...[...blocks, ...droppedToday, ...shelved].map((b) => ({
                    id: b.id,
                    name: b.name.replace(" Block", ""),
                    colour: b.bg,
                    notes: notes.filter((n) => n.blockId === b.id),
                  })),
                  { id: "day", name: "Day notes", colour: "color-mix(in srgb, var(--muted-foreground) 50%, transparent)", notes: notes.filter((n) => !n.blockId || !known.has(n.blockId)) },
                ]}
                place={place}
                onPlace={onPlace}
                onOpenNote={onOpenNote}
              />
            ) : (
              // categories and subcategories: samples until their shape is decided
              <Categories categories={categories} selected={category} onSelect={onCategory} onAdd={onCategoryAdd} onOpenNote={onOpenNote} />
            )}
          </div>
        </>
      )}

      {/* what the tree shows, where a theme toggle would sit */}
      {/* the same segment tabs as the top bar's Tasks | Blocks: your notes, or your reminders */}
      <Tabs value={section} onValueChange={onSection} variant="segment" className="flex shrink-0 justify-center">
        {/* its own grey: the panel is the same colour as the tabs' usual background */}
        <TabsList className="bg-foreground/[0.07]">
          <TabsTrigger value="notes" className="px-3 py-1 text-[13px]">
            Notes
          </TabsTrigger>
          <TabsTrigger value="reminders" className="px-3 py-1 text-[13px]">
            Reminders
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </aside>
  );
}
