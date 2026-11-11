"use client";

// The nudge to write something new, only when there are no notes at all: the art and the button,
// in the middle of the page, with nothing around them.

import { Plus } from "lucide-react";
import { AddArt } from "./add-art";

// label: what the button says, when the note is for somewhere in particular
function AddNoteButton({ onAdd, label = "Add a new note" }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      data-tour="add-note"
      className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-solid px-4 text-sm text-solid-ink transition-colors hover:bg-solid-hover"
    >
      <Plus className="size-4" />
      {label}
    </button>
  );
}

// no notes: the art and the way to start. text only shows when there's no button (a search found nothing)
export function NotesEmpty({ text, onAdd, label }) {
  return (
    <div className="flex h-full min-h-80 flex-col items-center justify-center gap-5 text-center">
      <AddArt className="h-auto w-64 max-w-full text-foreground/75" />
      {onAdd ? <AddNoteButton onAdd={onAdd} label={label} /> : text && <p className="max-w-xs text-sm text-foreground/45">{text}</p>}
    </div>
  );
}
