"use client";

// One note as a card: its checkbox selects it, a click opens it. Paper colour, date, pin, block and first lines.
// While searching, the lines the words turn up in take the place of the first lines.

import { CalendarDays, Pin } from "lucide-react";
import { noteColour, paperStyle } from "@/lib/note-colours";
import { findInNote } from "@/lib/note-search";
import { useBlocks } from "../blocks-provider";
import { Highlight, MatchCount, MatchLines } from "./highlight";
import { SelectBox } from "./select-box";

const day = (ms) =>
  new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

export function NoteCard({ note, query = "", selected, onToggleSelect, onOpen, onTogglePin }) {
  const { blocks, droppedToday, archived } = useBlocks();
  const block = note.blockId
    ? [...blocks, ...droppedToday, ...archived].find((b) => b.id === note.blockId)
    : null;
  const paper = noteColour(note.colour);
  const found = findInNote(note, query, 4);

  return (
    // a div, not a button: the checkbox and the pin inside it are buttons of their own
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(note)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(note);
        }
      }}
      style={paperStyle(paper)}
      className={`milo-paper relative flex min-h-56 cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl p-5 text-left transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
        selected ? "ring-2 ring-foreground/70" : "ring-1 ring-foreground/5"
      }`}
    >
      {/* the block's colour in the corner, small enough to stay clear of the checkbox */}
      {block && (
        <span
          aria-hidden
          className="absolute -left-4 -top-4 size-7 rotate-45"
          style={{ backgroundColor: block.bg }}
        />
      )}

      <div className="flex items-center justify-between gap-2 border-b border-dashed border-foreground/10 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <SelectBox checked={selected} onToggle={() => onToggleSelect(note.id)} />

          <span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-foreground/60">
            <CalendarDays className="size-3.5 shrink-0" />
            {day(note.createdAt)}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {found && <MatchCount count={found.count} />}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note);
            }}
            aria-pressed={!!note.pinned}
            aria-label={note.pinned ? "Unpin" : "Pin to the top"}
            className={`flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-foreground/5 ${
              note.pinned ? "text-foreground" : "text-foreground/30"
            }`}
          >
            <Pin className="size-3.5" fill={note.pinned ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <h3 className="line-clamp-2 break-words text-lg font-medium">
        {note.title?.trim() ? <Highlight text={note.title} query={query} /> : "Untitled"}
      </h3>

      {found && found.lines.length > 0 ? (
        <MatchLines found={found} />
      ) : note.text ? (
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
