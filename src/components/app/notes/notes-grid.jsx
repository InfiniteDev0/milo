"use client";

// Notes as cards, pinned first then newest. A click opens one; its checkbox selects it.
// With none at all, the page is the art and an add button, centred.

import { byPinnedThenNewest } from "@/lib/note-filters";
import { NotesEmpty } from "./add-note";
import { NoteCard } from "./note-card";

export function NotesGrid({ sort, notes, query, selected, onToggleSelect, onOpen, onTogglePin, onCover, empty, onAdd, addLabel }) {
  if (notes.length === 0) return <NotesEmpty text={empty} onAdd={onAdd} label={addLabel} />;

  const ordered = [...notes].sort(sort ?? byPinnedThenNewest);

  return (
    <div className="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 xl:grid-cols-3">
      {ordered.map((n) => (
        <NoteCard
          key={n.id}
          note={n}
          query={query}
          selecting={selected.size > 0}
          selected={selected.has(n.id)}
          onToggleSelect={onToggleSelect}
          onOpen={onOpen}
          onTogglePin={onTogglePin}
          onCover={onCover}
          // dragged onto a category in the side panel: this card, or all the selected ones if it's among them
          dragIds={() => (selected.has(n.id) ? [...selected] : [n.id])}
        />
      ))}
    </div>
  );
}
