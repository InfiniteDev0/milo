"use client";

// Notes as cards, pinned first then newest. A click opens one; its checkbox selects it.
// A tile to add a new note closes the grid, so a page with a few notes never looks blank.

import { byPinnedThenNewest } from "@/lib/note-filters";
import { AddNoteTile, NotesEmpty } from "./add-note";
import { NoteCard } from "./note-card";

export function NotesGrid({ notes, query, selected, onToggleSelect, onOpen, onTogglePin, empty, onAdd }) {
  if (notes.length === 0) return <NotesEmpty text={empty} onAdd={onAdd} />;

  const ordered = [...notes].sort(byPinnedThenNewest);

  return (
    <div className="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 xl:grid-cols-3">
      {ordered.map((n) => (
        <NoteCard
          key={n.id}
          note={n}
          query={query}
          selected={selected.has(n.id)}
          onToggleSelect={onToggleSelect}
          onOpen={onOpen}
          onTogglePin={onTogglePin}
        />
      ))}
      {onAdd && <AddNoteTile onAdd={onAdd} />}
    </div>
  );
}
