"use client";

// A category's note as a row in its Notes card, as a By block card has it: the grip that drags it
// into a new place, the tick that selects it, its title (matches lit) and the day it was written.
// A click opens it; a drag from anywhere else on it files it (and every ticked note with it) onto a
// category in the tree.

import { Highlight } from "./highlight";
import { NOTES_DRAG } from "./note-card";
import { SelectBox } from "./select-box";

const day = (ms) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export function NoteRow({ note: n, grip, query, selected, onToggle, onOpen }) {
  return (
    // a div, not a button: the tick inside is a button
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(NOTES_DRAG, JSON.stringify(selected.has(n.id) ? [...selected] : [n.id]));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => onOpen(n)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(n);
        }
      }}
      title="Click to open, drag onto a category to move it"
      className={`flex cursor-pointer items-center gap-2.5 rounded-lg bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-card/70 ${
        selected.has(n.id) ? "ring-1 ring-inset ring-foreground/40" : ""
      }`}
    >
      {grip}
      <SelectBox checked={selected.has(n.id)} onToggle={() => onToggle(n.id)} />
      <span className="min-w-0 flex-1 truncate">{n.title?.trim() ? <Highlight text={n.title} query={query} /> : "Untitled"}</span>
      <span className="shrink-0 text-[11px] tabular-nums text-foreground/35">{day(n.createdAt)}</span>
    </div>
  );
}
