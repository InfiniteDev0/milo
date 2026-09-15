"use client";

// The nudge to write something new: a tile after your notes, or the whole page when there are none.

import { Plus } from "lucide-react";
import { AddArt } from "./add-art";

function AddNoteButton({ onAdd }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      style={{ "--lift": "var(--solid-lift)" }}
      className="milo-lift flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-solid px-4 text-sm text-solid-ink hover:bg-solid-hover"
    >
      <Plus className="size-4" />
      Add a new note
    </button>
  );
}

// sits in the grid beside your notes, so a short page never looks empty
export function AddNoteTile({ onAdd }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-5 rounded-2xl bg-foreground/4 p-5">
      <AddArt className="h-auto w-44 text-foreground/75" />
      <AddNoteButton onAdd={onAdd} />
    </div>
  );
}

// no notes at all: the art in the middle, what the page is for, and the way to start
export function NotesEmpty({ text, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <AddArt className="h-auto w-64 max-w-full text-foreground/75" />
      <p className="max-w-xs text-sm text-foreground/45">{text}</p>
      {onAdd && <AddNoteButton onAdd={onAdd} />}
    </div>
  );
}
