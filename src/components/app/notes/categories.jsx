"use client";

/* The categories tree, as the reference draws it: each category opens to show
   its subcategories on a guide line. Click a name to see it on the right; the
   chevron opens it, showing its subcategories and then its own notes. Add
   category is a dashed box, like Hidden tasks on the Blocks page, and a new one
   starts with its name ready to type. Drag note cards onto a category or
   subcategory to file them there; the row lights up while they're over it.

   A failed read never shows as "no categories", and nothing is offered until
   the real ones have loaded. */

import { useState } from "react";
import { ChevronRight, FileText, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tip } from "../tasks-view/tip";
import { useNotes } from "../notes-provider";
import { CategoryMenu } from "./category-menu";
import { PickedIcon } from "../icon-picker/picked-icon";
import { NOTES_DRAG } from "./note-card";

// the accordion's ease, as the cards and Hidden tasks use
const EASE = "duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]";
const TOOL =
  "flex size-6 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground";
// + and ⋯, shown on hover, focus, or while the menu is open
const TOOLS =
  "flex items-center opacity-0 transition-opacity group-focus-within/cat:opacity-100 group-hover/cat:opacity-100 group-has-[[data-popup-open]]/cat:opacity-100";

// the name, or a box to type it in while renaming
function Name({ category, renaming, onRenamed, onSelect, count }) {
  if (renaming) {
    return (
      <input
        autoFocus
        defaultValue={category.name}
        placeholder="Untitled"
        aria-label="Category name"
        onFocus={(e) => e.target.select()}
        onBlur={(e) => onRenamed(e.target.value.trim())}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") onRenamed(null);
        }}
        className="min-w-0 flex-1 rounded-sm bg-background px-1.5 py-0.5 outline-none ring-1 ring-[#2f80ed]"
      />
    );
  }
  return (
    <button type="button" data-tour="category-name" onClick={onSelect} className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left">
      <span className="truncate">{category.name || "Untitled"}</span>
      {/* a favourite says so */}
      {category.favorite && <Star className="size-3 shrink-0 fill-[#f5c542] text-[#f5c542]" aria-label="Favorite" />}
      {count > 0 && <span className="ms-auto shrink-0 text-[11px] tabular-nums text-muted-foreground">{count}</span>}
    </button>
  );
}

// categories: from useCategories. selected: the one shown on the right. onAdd(id): a new note in it.
// onOpenNote(note, categoryId): open a note from the tree
export function Categories({ categories, selected, onSelect, onAdd, onOpenNote }) {
  const [open, setOpen] = useState(() => new Set());
  const [renaming, setRenaming] = useState(null);
  // the row note cards are being dragged over
  const [over, setOver] = useState(null);
  const { list, hydrated, loadFailed, canWrite } = categories;
  const { notes, fileNotes } = useNotes();

  // a row that takes dropped note cards
  const dropOn = (c) =>
    canWrite && {
      onDragOver: (e) => {
        if (!e.dataTransfer.types.includes(NOTES_DRAG)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (over !== c.id) setOver(c.id);
      },
      onDragLeave: (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOver(null);
      },
      onDrop: (e) => {
        setOver(null);
        const ids = e.dataTransfer.getData(NOTES_DRAG);
        if (!ids) return;
        e.preventDefault();
        fileNotes(JSON.parse(ids), c);
      },
    };
  const LIT = "bg-[#2f80ed]/15 ring-1 ring-[#2f80ed]/60";

  const toggle = (id, to) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (to ?? !next.has(id)) next.add(id);
      else next.delete(id);
      return next;
    });

  // Escape (null) keeps the old name, and so does an emptied one
  const renamed = (c) => (name) => {
    if (name && name !== c.name) categories.rename(c.id, name);
    setRenaming(null);
  };

  const add = (parentId = null) => {
    const c = categories.addCategory({ parentId });
    if (!c) return;
    if (parentId) toggle(parentId, true);
    setRenaming(c.id);
  };

  // leaving the right side on a category that's gone would show nothing
  const trash = (c) => {
    categories.trash(c.id);
    if (selected === c.id || list.some((s) => s.parentId === c.id && s.id === selected)) onSelect(null);
  };

  if (loadFailed) {
    return <p className="px-2.5 text-xs leading-relaxed text-muted-foreground">Couldn&rsquo;t reach your categories. Nothing is lost.</p>;
  }
  if (!hydrated) {
    return (
      <div className="flex flex-col gap-1.5 px-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-7 animate-pulse rounded-sm bg-foreground/5" />
        ))}
      </div>
    );
  }

  const tops = list.filter((c) => !c.parentId);
  const siblingsOf = (c) => list.filter((x) => (x.parentId ?? null) === (c.parentId ?? null));
  const tools = (c, isSub) =>
    canWrite && (
      <span className={TOOLS}>
        <Tip label="Add a note inside" side="bottom">
          <button type="button" onClick={() => onAdd?.(c.id)} aria-label={`Add a note inside ${c.name || "Untitled"}`} className={TOOL}>
            <Plus className="size-4" />
          </button>
        </Tip>
        <CategoryMenu
          category={c}
          isSub={isSub}
          tops={tops}
          hasSubs={list.some((s) => s.parentId === c.id)}
          onFavorite={() => categories.toggleFavorite(c.id)}
          onAddSub={() => add(c.id)}
          onDuplicate={(withSubs) => categories.duplicate(c.id, withSubs)}
          onRename={() => setRenaming(c.id)}
          onMove={(parentId) => categories.move(c.id, parentId)}
          onTrash={() => trash(c)}
          onShift={(by) => categories.shift(c.id, by)}
          first={siblingsOf(c)[0]?.id === c.id}
          last={siblingsOf(c).at(-1)?.id === c.id}
        />
      </span>
    );

  return (
    <nav aria-label="Categories" data-tour="categories" className="flex flex-col gap-0.5">
      {tops.map((c) => {
        const isOpen = open.has(c.id);
        const subs = list.filter((s) => s.parentId === c.id);
        const own = notes.filter((n) => n.categoryId === c.id);
        return (
          <div key={c.id}>
            {/* at rest: the icon and the name. On hover (or picked, or with its menu open) the row takes a
                box, the icon turns into the chevron (with a box of its own under the pointer), and + and ⋯ show */}
            <div
              {...dropOn(c)}
              className={cn(
                "group/cat flex h-9 items-center gap-1.5 rounded-sm px-1.5 text-sm font-medium transition-colors hover:bg-foreground/6 has-[[data-popup-open]]:bg-foreground/6",
                selected === c.id && "bg-foreground/6",
                over === c.id && LIT,
              )}
            >
              <button
                type="button"
                onClick={() => toggle(c.id)}
                aria-expanded={isOpen}
                aria-label={isOpen ? `Close ${c.name || "Untitled"}` : `Open ${c.name || "Untitled"}`}
                className="relative flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors hover:bg-foreground/10"
              >
                <PickedIcon icon={c.icon} size={15} className="group-hover/cat:invisible" />
                <ChevronRight
                  className={cn(
                    "absolute size-4 text-muted-foreground opacity-0 transition-[rotate,opacity] group-hover/cat:opacity-100",
                    EASE,
                    isOpen && "rotate-90",
                  )}
                />
              </button>
              <Name category={c} renaming={renaming === c.id} onRenamed={renamed(c)} onSelect={() => onSelect(c.id)} />
              {tools(c, false)}
            </div>

            {/* the chevron opens what's inside: its subcategories on a guide line under the icon, or that
                there's nothing. It opens the way the accordion does: the height eases open from nothing, the
                rows fade in and settle with a brief focus pull */}
            <div
              className={cn("grid transition-[grid-template-rows,opacity]", EASE, isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
              inert={!isOpen}
            >
              <div className="min-h-0 overflow-hidden">
                <ul
                  className={cn(
                    "mb-1 ms-[1.1rem] border-s border-foreground/15 transition-[translate,filter]",
                    EASE,
                    isOpen ? "translate-y-0 blur-none" : "-translate-y-1.5 blur-[2px]",
                  )}
                >
                  {subs.length === 0 && own.length === 0 && <li className="py-1.5 ps-4 text-sm text-muted-foreground/70">No notes inside</li>}
                  {subs.map((s) => (
                    <li
                      key={s.id}
                      {...dropOn(s)}
                      className={cn(
                        "group/cat relative flex h-8 items-center gap-1.5 rounded-sm ps-4 pe-1.5 text-sm text-muted-foreground transition-colors before:absolute before:start-0 before:top-1/2 before:w-2.5 before:border-t before:border-foreground/15 hover:bg-foreground/6 hover:text-foreground has-[[data-popup-open]]:bg-foreground/6",
                        selected === s.id && "bg-foreground/6 text-foreground",
                        over === s.id && LIT,
                      )}
                    >
                      {s.icon && <PickedIcon icon={s.icon} size={13} />}
                      <Name category={s} renaming={renaming === s.id} onRenamed={renamed(s)} onSelect={() => onSelect(s.id)} count={notes.filter((n) => n.categoryId === s.id).length} />
                      {tools(s, true)}
                    </li>
                  ))}
                  {/* its own notes, after its subcategories; a click opens one */}
                  {own.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => onOpenNote?.(n, c.id)}
                        className="relative flex h-8 w-full cursor-pointer items-center gap-2 rounded-sm ps-4 pe-1.5 text-left text-sm text-muted-foreground transition-colors before:absolute before:start-0 before:top-1/2 before:w-2.5 before:border-t before:border-foreground/15 hover:bg-foreground/6 hover:text-foreground"
                      >
                        <FileText className="size-3.5 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">{n.title?.trim() || "Untitled"}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}

      {canWrite && (
        <button
          type="button"
          data-tour="add-category"
          onClick={() => add()}
          className="mt-2 flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-foreground/15 px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <Plus className="size-4" />
          Add category
        </button>
      )}
    </nav>
  );
}
