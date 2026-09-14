"use client";

// Every note as a card: pinned ones first, then the newest.

import { NoteCard } from "./note-card";

export function AllNotes({ notes, onOpen, onTogglePin }) {
  if (notes.length === 0) {
    return (
      <p className="pt-16 text-center text-sm text-foreground/40">
        No notes yet. Anything you write lands here.
      </p>
    );
  }

  const ordered = [...notes].sort((a, b) =>
    a.pinned === b.pinned ? b.createdAt - a.createdAt : b.pinned ? 1 : -1,
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {ordered.map((n) => (
        <NoteCard key={n.id} note={n} onOpen={onOpen} onTogglePin={onTogglePin} />
      ))}
    </div>
  );
}
