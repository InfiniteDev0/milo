"use client";

// One note as a card: its paper colour, when it was written, its pin, its block, and its first lines.

import { CalendarDays, Pin } from "lucide-react";
import { noteColour } from "@/lib/note-colours";
import { useBlocks } from "../blocks-provider";

const day = (ms) =>
  new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

export function NoteCard({ note, onOpen, onTogglePin }) {
  const { blocks, archived } = useBlocks();
  const block = note.blockId ? [...blocks, ...archived].find((b) => b.id === note.blockId) : null;
  const paper = noteColour(note.colour);

  return (
    // a div, not a button: the pin inside it is a button of its own
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(note.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(note.id);
        }
      }}
      style={{ backgroundColor: paper.bg }}
      className="milo-on-tint relative flex min-h-56 cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl p-5 text-left ring-1 ring-foreground/5 transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
    >
      {/* the block's colour in the corner, when the note belongs to one */}
      {block && (
        <span
          aria-hidden
          className="absolute -left-4 -top-4 size-9 rotate-45"
          style={{ backgroundColor: block.bg }}
        />
      )}

      <div className="flex items-center justify-between gap-2 border-b border-dashed border-foreground/10 pb-3">
        <span className="flex items-center gap-1.5 text-xs text-foreground/60">
          <CalendarDays className="size-3.5" />
          {day(note.createdAt)}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note);
          }}
          aria-pressed={!!note.pinned}
          aria-label={note.pinned ? "Unpin" : "Pin to the top"}
          className={`flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-foreground/5 ${
            note.pinned ? "text-foreground" : "text-foreground/30"
          }`}
        >
          <Pin className="size-3.5" fill={note.pinned ? "currentColor" : "none"} />
        </button>
      </div>

      <h3 className="line-clamp-2 break-words text-lg font-medium">
        {note.title?.trim() || "Untitled"}
      </h3>

      {note.text ? (
        <p className="line-clamp-6 break-words text-sm leading-relaxed text-foreground/65">
          {note.text}
        </p>
      ) : (
        <p className="text-sm text-foreground/30">Nothing written yet.</p>
      )}

      {block && (
        <span
          className="mt-auto w-fit rounded-md px-2 py-0.5 text-[11px]"
          style={{ backgroundColor: block.bg, color: block.ink }}
        >
          {block.name.replace(" Block", "")}
        </span>
      )}
    </div>
  );
}
