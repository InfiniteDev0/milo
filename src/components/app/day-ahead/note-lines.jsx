"use client";

// Notes left for a block or a day, and the way to leave another.

import { Plus } from "lucide-react";

export function NoteLines({ title, notes, onOpen, onAdd, addLabel }) {
  return (
    <div className="flex flex-col gap-2">
      {notes.length > 0 && <span className="text-xs text-foreground/45">{title}</span>}

      {notes.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => onOpen(n.id)}
          className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-foreground/4 px-3 py-2 text-left text-sm transition-colors hover:bg-foreground/8"
        >
          <span className="min-w-0 flex-1 truncate">{n.title?.trim() || "Untitled"}</span>
          {n.text && <span className="max-w-[45%] truncate text-xs text-foreground/40">{n.text}</span>}
        </button>
      ))}

      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-foreground/55 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <Plus className="size-3.5" />
          {addLabel}
        </button>
      )}
    </div>
  );
}
