"use client";

/* One category, opened from the tree: its icon (click to change), its name and
   what's in it, then Tasks and Notes as two sections that look alike. With tasks
   but no notes, Notes is one quiet line with Add a note, not the big picture;
   the picture is only for a category with nothing in it at all. Everything sits
   on the header's left edge. */

import { Plus } from "lucide-react";
import { useCategories } from "../categories-provider";
import { IconPicker, PickedIcon } from "../icon-picker";
import { COUNT } from "../view-header";
import { CardsView } from "./cards-view";
import { CategoryTasks, useCategoryTasks } from "./category-tasks";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function SectionHead({ label, count }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      {label}
      <span className={COUNT}>{count}</span>
    </h3>
  );
}

// ids: the category and its subcategories. notes: the notes in them. onAdd: a new note here (when you can write)
export function CategoryPage({ category, parent, ids, notes, query, onOpen, onAdd }) {
  const categories = useCategories();
  const tasks = useCategoryTasks(ids);
  const name = category.name || "Untitled";
  const hasTasks = Array.isArray(tasks) && tasks.length > 0;
  // tasks but no notes (and no search): Notes is a line, not the picture
  const quietNotes = hasTasks && notes.length === 0 && !query?.trim();

  return (
    <>
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-5 text-sm">
        {/* the icon: click it for emoji, icons or a picture of your own */}
        <IconPicker value={category.icon} onChange={(icon) => categories.setIcon(category.id, icon)}>
          <button
            type="button"
            data-tour="category-icon"
            aria-label="Change icon"
            className="-ms-1 flex size-7 cursor-pointer items-center justify-center rounded-sm transition-colors hover:bg-foreground/10 data-popup-open:bg-foreground/10"
          >
            <PickedIcon icon={category.icon} size={16} />
          </button>
        </IconPicker>
        <span className="min-w-0 flex-1 truncate font-medium">
          {parent && <span className="font-normal text-muted-foreground">{parent.name || "Untitled"} / </span>}
          {name}
        </span>
        <span className="shrink-0 text-muted-foreground">
          {hasTasks && `${plural(tasks.length, "task")} · `}
          {plural(notes.length, "note")}
        </span>
      </div>

      <div data-tour="category-view" className="flex min-h-0 flex-1 flex-col gap-6 px-5 pt-5">
        {tasks === false && <p className="text-xs text-muted-foreground">Couldn&rsquo;t reach this category&rsquo;s tasks.</p>}
        {hasTasks && (
          <section className="flex shrink-0 flex-col gap-2.5">
            <SectionHead label="Tasks" count={tasks.length} />
            <CategoryTasks tasks={tasks} />
          </section>
        )}

        {quietNotes ? (
          <section className="flex shrink-0 flex-col gap-2.5">
            <SectionHead label="Notes" count={0} />
            <div className="flex h-12 items-center gap-3 rounded-lg border border-dashed border-foreground/15 ps-3 pe-1.5 text-sm text-muted-foreground">
              <span className="min-w-0 flex-1 truncate">No notes in {name} yet.</span>
              {onAdd && (
                <button
                  type="button"
                  onClick={onAdd}
                  data-tour="add-note"
                  className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-3 text-foreground transition-colors hover:bg-foreground/8"
                >
                  <Plus className="size-4" />
                  Add a note
                </button>
              )}
            </div>
          </section>
        ) : (
          // gap-0.5: the cards bring 8px of their own, so the head sits as close as Tasks does
          <section className="flex min-h-0 flex-1 flex-col gap-0.5">
            {hasTasks && <SectionHead label="Notes" count={notes.length} />}
            <CardsView
              notes={notes}
              search={query}
              onOpen={onOpen}
              onAdd={onAdd}
              addLabel={`Add a note to ${name}`}
              empty={`Nothing in ${name} yet.`}
            />
          </section>
        )}
      </div>
    </>
  );
}
