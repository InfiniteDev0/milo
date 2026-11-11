"use client";

/* A category's two cards. Tasks: its own search and + (the New task dialog).
   Notes: as a By block card has them — its own search, +, and a tick on each
   note; ticked notes get the selection bar (Move to a block or category,
   Delete), and drag together onto a category in the tree. In both, a row's
   grip drags it into a new place, and that order is kept (order / onOrder). The page's
   search box narrows the notes too, until the card's own search is used. */

import { useState } from "react";
import { matchesSearch } from "@/lib/note-search";
import { useCategories } from "../categories-provider";
import { useNotes } from "../notes-provider";
import { NoteRow } from "./category-notes";
import { AddButton, CategoryPanel, SearchBox, SearchButton } from "./category-panel";
import { TaskRow } from "./category-tasks";
import { inOrder, mergeOrder, ReorderList } from "./row-order";
import { SelectionBar } from "./selection-bar";
import { useSelection } from "./use-selection";

// a search button and its box, kept together: closing it clears it
function useCardSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const toggle = () => {
    setOpen((v) => !v);
    setQuery("");
  };
  return { open, query, setQuery, toggle };
}

// tasks: null while they load, false if they couldn't. onNew: opens the New task dialog (when you can write).
// order: the task ids in the order they were dragged into. onOrder(ids): keeps a new one
export function TasksCard({ tasks, name, onNew, order, onOrder }) {
  const search = useCardSearch();
  const loaded = Array.isArray(tasks);
  const ordered = loaded ? inOrder(tasks, order) : [];
  const words = search.query.trim().toLowerCase();
  const shown = ordered.filter((t) => !words || (t.title ?? "").toLowerCase().includes(words));

  return (
    <CategoryPanel
      title="Tasks"
      sub={words ? `Tasks matching “${search.query.trim()}”` : `Tasks labelled ${name}`}
      count={loaded ? shown.length : null}
      unit="task"
      actions={
        <>
          {loaded && tasks.length > 0 && <SearchButton label="Search tasks" on={search.open} onClick={search.toggle} />}
          {onNew && <AddButton label="New task" onClick={onNew} />}
        </>
      }
      tools={search.open && <SearchBox value={search.query} onChange={search.setQuery} placeholder="Search tasks" />}
      empty={
        tasks === false
          ? "Couldn’t reach this category’s tasks."
          : loaded && shown.length === 0
            ? words
              ? "Nothing matches that."
              : "No tasks labelled with it yet."
            : null
      }
    >
      {loaded && (
        <ReorderList
          items={shown}
          renderRow={(t, grip) => <TaskRow task={t} grip={grip} />}
          onReorder={(ids) => onOrder(mergeOrder(ordered.map((t) => t.id), ids))}
        />
      )}
    </CategoryPanel>
  );
}

// pageQuery: the Notes page's own search box. onAdd: a new note here, opened at once (when you can write).
// order / onOrder: as the Tasks card has them, for its notes
export function NotesCard({ notes, name, pageQuery, onOpen, onAdd, order, onOrder }) {
  const { moveNotes, removeNotes, fileNotes } = useNotes();
  const categories = useCategories();
  const search = useCardSearch();
  const query = search.query || pageQuery || "";
  const searched = query.trim() !== "";
  // newest first, then the order they were dragged into
  const ordered = inOrder([...notes].sort((a, b) => b.createdAt - a.createdAt), order);
  const shown = ordered.filter((n) => matchesSearch(n, query));
  const { selected, toggle, clear, selectAll } = useSelection(new Set(shown.map((n) => n.id)));

  return (
    <CategoryPanel
      title="Notes"
      sub={searched ? `Notes matching “${query.trim()}”` : `Notes in ${name}`}
      count={shown.length}
      unit="note"
      actions={
        <>
          {notes.length > 0 && <SearchButton label="Search notes" on={search.open} onClick={search.toggle} />}
          {onAdd && <AddButton label={`Add a note to ${name}`} onClick={onAdd} tour="add-note" />}
        </>
      }
      tools={
        <>
          {search.open && <SearchBox value={search.query} onChange={search.setQuery} placeholder="Search notes" />}
          {selected.size > 0 && (
            <SelectionBar
              count={selected.size}
              total={shown.length}
              onSelectAll={selectAll}
              onMove={(block) => {
                moveNotes([...selected], block);
                clear();
              }}
              onDelete={() => {
                removeNotes([...selected]);
                clear();
              }}
              onClear={clear}
              categories={categories.hydrated && !categories.loadFailed ? categories : undefined}
              onFile={(category) => {
                fileNotes([...selected], category);
                clear();
              }}
            />
          )}
        </>
      }
      empty={shown.length === 0 ? (searched ? "Nothing matches that." : "No notes here yet.") : null}
    >
      <ReorderList
        items={shown}
        renderRow={(n, grip) => <NoteRow note={n} grip={grip} query={query} selected={selected} onToggle={toggle} onOpen={onOpen} />}
        onReorder={(ids) => onOrder(mergeOrder(ordered.map((n) => n.id), ids))}
      />
    </CategoryPanel>
  );
}
