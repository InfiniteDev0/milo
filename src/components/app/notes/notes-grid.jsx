"use client";

// Notes as cards, pinned first then newest. A click opens one; its checkbox selects it.

import { byPinnedThenNewest } from "@/lib/note-filters";
import { NoteCard } from "./note-card";

export function NotesGrid({ notes, query, selected, onToggleSelect, onOpen, onTogglePin, empty }) {
  if (notes.length === 0) {
    return <p className="pt-16 text-center text-sm text-foreground/40">{empty}</p>;
  }

  const ordered = [...notes].sort(byPinnedThenNewest);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
    </div>
  );
}
