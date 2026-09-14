"use client";

// One note in the sheet's stack: its title, when it was written, its block, and its first lines.

import { shade } from "@/lib/shade";
import { noteColour } from "@/lib/note-colours";
import { useBlocks } from "../blocks-provider";

const clock = (ms) => new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function NoteRow({ note, onOpen }) {
  const { blocks, archived } = useBlocks();
  const block = note.blockId ? [...blocks, ...archived].find((b) => b.id === note.blockId) : null;
  const paper = noteColour(note.colour);

  return (
    <button
      type="button"
      onClick={() => onOpen(note.id)}
      // each note in its own colour, darkened for the lift — never grey under a coloured card
      style={{ backgroundColor: paper.bg, "--lift": shade(paper.bg) }}
      className="milo-on-tint milo-lift w-full cursor-pointer rounded-xl border border-foreground/10 px-3 py-3 text-left"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {note.title?.trim() || "Untitled"}
        </span>
        <span className="shrink-0 text-[11px] text-foreground/30 tabular-nums">
          {clock(note.createdAt)}
        </span>
      </div>

      {block && (
        <span
          className="mt-1 inline-flex rounded-md px-1.5 py-0.5 text-[10px]"
          style={{ backgroundColor: block.bg, color: block.ink }}
        >
          {block.name.replace(" Block", "")}
        </span>
      )}

      {note.text && (
        <p className="line-clamp-2 break-words pt-1 text-xs leading-relaxed text-foreground/45">
          {note.text}
        </p>
      )}
    </button>
  );
}
