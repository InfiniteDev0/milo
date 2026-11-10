"use client";

/* One category as a page of its own (the Notes tabs step aside): a cover across
   the top (or a band that says Add cover), its icon sitting on the cover's edge,
   the title (double-click to rename), then its Tasks and Notes cards side by
   side, each with its +. The page scrolls. */

import { useState } from "react";
import { toast } from "sonner";
import { createDayTask } from "@/lib/db/day-tasks";
import { matchesSearch } from "@/lib/note-search";
import { useCategories } from "../categories-provider";
import { IconPicker, PickedIcon } from "../icon-picker";
import { InlineName } from "../tasks-view/inline-name";
import { CategoryCover, useCoverPicker } from "./category-cover";
import { CategoryNoteRows } from "./category-notes";
import { AddButton, CategoryPanel } from "./category-panel";
import { CategoryTaskRows, useCategoryTasks } from "./category-tasks";
import { NewTaskDialog } from "./new-task-dialog";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// ids: the category and its subcategories. notes: the notes in them. onAdd: a new note here. onBack: to All notes
export function CategoryPage({ category, parent, ids, notes, query, onOpen, onAdd, onBack }) {
  const categories = useCategories();
  const canWrite = categories.canWrite;
  const [tasks, reload] = useCategoryTasks(ids);
  const [drafting, setDrafting] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const { pick, input } = useCoverPicker((src) => categories.setCover(category.id, src));
  const name = category.name || "Untitled";
  const searched = Boolean(query?.trim());
  const shown = notes.filter((n) => matchesSearch(n, query));

  // a task from the dialog, onto its day; the Tasks view reads it when it next opens. true once saved
  const addTask = async ({ day, ...task }) => {
    const { error } = await createDayTask(day, task);
    if (error) {
      toast("Couldn’t add that task. Try again in a moment.");
      return false;
    }
    const today = day.toDateString() === new Date().toDateString();
    toast(`Added to ${today ? "today" : day.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })} in Tasks.`);
    reload();
    return true;
  };

  return (
    <div data-tour="category-view" className="scrollbar-pill min-h-0 flex-1 overflow-y-auto">
      {input}
      <CategoryCover
        cover={category.cover}
        y={category.coverY}
        onPick={canWrite ? pick : undefined}
        onRemove={() => categories.setCover(category.id, null)}
        onMove={(y) => categories.setCoverY(category.id, y)}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 pb-14 sm:px-10">
        {/* the icon on the cover's edge, no box of its own: click it for emoji, icons or a picture */}
        <IconPicker value={category.icon} onChange={(icon) => categories.setIcon(category.id, icon)}>
          <button
            type="button"
            data-tour="category-icon"
            aria-label="Change icon"
            className="relative z-10 -mt-12 flex size-24 shrink-0 cursor-pointer items-center justify-center self-start transition-opacity hover:opacity-80"
          >
            <PickedIcon icon={category.icon} size={72} />
          </button>
        </IconPicker>

        {/* where it sits: Notes takes you back */}
        <p className="mt-5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <button type="button" onClick={onBack} className="cursor-pointer transition-colors hover:text-foreground">
            Notes
          </button>
          /
          {parent && (
            <>
              <span className="truncate">{parent.name || "Untitled"}</span>/
            </>
          )}
        </p>
        <InlineName
          value={category.name}
          editing={renaming}
          onEdit={canWrite ? () => setRenaming(true) : undefined}
          onSave={(next) => categories.rename(category.id, next)}
          onStop={() => setRenaming(false)}
          className="mt-1 block text-4xl font-bold tracking-tight [overflow-wrap:anywhere]"
          inputClassName="mt-1 text-4xl font-bold tracking-tight"
        >
          <span title={canWrite ? "Double-click to rename" : undefined}>{name}</span>
        </InlineName>
        <p className="mt-2 text-sm text-muted-foreground">
          {Array.isArray(tasks) && `${plural(tasks.length, "task")} · `}
          {plural(notes.length, "note")}
        </p>

        {/* the two cards, side by side; stacked on a phone */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <CategoryPanel
            title="Tasks"
            sub={`Tasks labelled ${name}`}
            count={Array.isArray(tasks) ? tasks.length : null}
            unit="task"
            action={canWrite && <AddButton label="New task" onClick={() => setDrafting(true)} />}
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
            sub={searched ? `Notes matching “${query.trim()}”` : `Notes in ${name}`}
            count={shown.length}
            unit="note"
            action={onAdd && <AddButton label={`Add a note to ${name}`} onClick={onAdd} tour="add-note" />}
            empty={shown.length === 0 ? (searched ? "Nothing matches that." : "No notes here yet.") : null}
          >
            <CategoryNoteRows notes={shown} query={query} onOpen={onOpen} />
          </CategoryPanel>
        </div>
      </div>

      <NewTaskDialog open={drafting} onOpenChange={setDrafting} categoryId={category.id} onCreate={addTask} />
    </div>
  );
}
