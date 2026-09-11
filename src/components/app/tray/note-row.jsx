"use client";

// One note in the stack. Same card as everywhere else in Milo.

import { shade } from "@/lib/shade";
import { noteColour } from "@/lib/note-colours";

const clock = (ms) =>
  new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function NoteRow({ note, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(note.id)}
      // the stack shows each note in its own colour, so they are tellable apart
      style={{
        backgroundColor: noteColour(note.colour).bg,
        // the note's own colour, darkened — same rule as blocks, so a lift is
        // never grey under a coloured card
        "--lift": shade(noteColour(note.colour).bg),
      }}
      className="milo-lift w-full cursor-pointer rounded-xl border border-black/10 px-3 py-3 text-left"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {note.title?.trim() || "Untitled"}
        </span>
        <span className="shrink-0 text-[11px] text-black/30 tabular-nums">
          {clock(note.createdAt)}
        </span>
      </div>

      {/* the first line of it, so the stack is scannable without opening one */}
      {note.preview && (
        <p className="line-clamp-2 break-words pt-0.5 text-xs leading-relaxed text-black/45">
          {note.preview}
        </p>
      )}
    </button>
  );
}
