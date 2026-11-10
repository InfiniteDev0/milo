"use client";

// A category's notes as rows in its Notes card: title (matches lit) and the day it was written.
// A click opens it; a drag still files it onto another category in the tree.

import { FileText } from "lucide-react";
import { Highlight } from "./highlight";
import { NOTES_DRAG } from "./note-card";
import { ROW } from "./category-panel";

const day = (ms) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export function CategoryNoteRows({ notes, query, onOpen }) {
  return [...notes]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((n) => (
      <li key={n.id}>
        <button
          type="button"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData(NOTES_DRAG, JSON.stringify([n.id]));
            e.dataTransfer.effectAllowed = "move";
          }}
          onClick={() => onOpen(n)}
          title="Click to open, drag onto a category to move"
          className={ROW}
        >
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">{n.title?.trim() ? <Highlight text={n.title} query={query} /> : "Untitled"}</span>
          <span className="shrink-0 text-[11px] tabular-nums text-foreground/35">{day(n.createdAt)}</span>
        </button>
      </li>
    ));
}
