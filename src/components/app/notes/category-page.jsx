"use client";

/* One category, opened from the tree: its icon (click to change), its name and
   counts, then two cards side by side, drawn like the By block cards: Tasks on
   the left, Notes on the right, each scrolling on its own. On a phone they stack.
   The page's search narrows the notes. */

import { Plus } from "lucide-react";
import { matchesSearch } from "@/lib/note-search";
import { useCategories } from "../categories-provider";
import { IconPicker, PickedIcon } from "../icon-picker";
import { CategoryPanel } from "./category-panel";
import { CategoryTaskRows, useCategoryTasks } from "./category-tasks";
import { CategoryNoteRows } from "./category-notes";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// ids: the category and its subcategories. notes: the notes in them. onAdd: a new note here (when you can write)
export function CategoryPage({
  category,
  parent,
  ids,
  notes,
  query,
  onOpen,
  onAdd,
}) {
  const categories = useCategories();
  const tasks = useCategoryTasks(ids);
  const name = category.name || "Untitled";
  const searched = Boolean(query?.trim());
  const shown = notes.filter((n) => matchesSearch(n, query));

  return (
    <>
      {/* the page scrolls on a phone; on wider screens the cards fill what's left and scroll inside */}
      <div
        data-tour="category-view"
        className="scrollbar-pill flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 sm:overflow-hidden"
      >
        {/* the box along the top: its icon (click to change), its name, and what's in it */}
        <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-foreground/4 p-4">
          <IconPicker
            value={category.icon}
            onChange={(icon) => categories.setIcon(category.id, icon)}
          >
            <button
              type="button"
              data-tour="category-icon"
              aria-label="Change icon"
              className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-card ring-1 ring-foreground/10 transition-colors hover:bg-card/70 data-popup-open:ring-foreground/30"
            >
              <PickedIcon icon={category.icon} size={24} />
            </button>
          </IconPicker>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {parent && (
              <span className="truncate text-xs text-muted-foreground">
                {parent.name || "Untitled"}
              </span>
            )}
            <span className="truncate text-lg font-medium">{name}</span>
          </div>
          <span className="shrink-0 text-sm text-muted-foreground">
            {Array.isArray(tasks) && `${plural(tasks.length, "task")} · `}
            {plural(notes.length, "note")}
          </span>
        </div>

        {/* the two cards, side by side under it; stacked on a phone */}
        <div className="grid shrink-0 grid-cols-1 gap-4 sm:min-h-0 sm:flex-1 sm:grid-cols-2 sm:grid-rows-[minmax(0,1fr)]">
          <CategoryPanel
            title="Tasks"
            sub={`Tasks labelled ${name}`}
            count={Array.isArray(tasks) ? tasks.length : null}
            unit="task"
            empty={
              tasks === false
                ? "Couldn’t reach this category’s tasks."
                : tasks?.length === 0
                  ? "No tasks labelled with it yet."
                  : null
            }
          >
            {Array.isArray(tasks) && <CategoryTaskRows tasks={tasks} />}
          </CategoryPanel>

          <CategoryPanel
            title="Notes"
            sub={
              searched ? `Notes matching “${query.trim()}”` : `Notes in ${name}`
            }
            count={shown.length}
            unit="note"
            action={
              onAdd && (
                <button
                  type="button"
                  onClick={onAdd}
                  data-tour="add-note"
                  aria-label={`Add a note to ${name}`}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-solid text-solid-ink hover:bg-solid-hover"
                >
                  <Plus className="size-4" />
                </button>
              )
            }
            empty={
              shown.length === 0
                ? searched
                  ? "Nothing matches that."
                  : "No notes here yet."
                : null
            }
          >
            <CategoryNoteRows notes={shown} query={query} onOpen={onOpen} />
          </CategoryPanel>
        </div>
      </div>
    </>
  );
}
