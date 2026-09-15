"use client";

// One note in a sheet's stack: its title, when it was written, its block, and its first lines.
// While searching, the lines the words turn up in take the place of the first lines.

import { noteColour, paperStyle } from "@/lib/note-colours";
import { findInNote } from "@/lib/note-search";
import { useBlocks } from "../blocks-provider";
import { Highlight, MatchCount, MatchLines } from "../notes/highlight";
import { SelectBox } from "../notes/select-box";

const clock = (ms) => new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const date = (ms) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export function NoteRow({ note, onOpen, query = "", when = "time", since = null, showBlock = true, selected, onToggleSelect }) {
  // a note left for today from an earlier day shows when it was written, not a time that reads as today's
  const dated = when === "date" || (since != null && note.createdAt < since);
  const { blocks, droppedToday, archived } = useBlocks();
  const block =
    showBlock && note.blockId
      ? [...blocks, ...droppedToday, ...archived].find((b) => b.id === note.blockId)
      : null;
  const paper = noteColour(note.colour);
  const found = findInNote(note, query, 2);

  return (
    // a div, not a button: the tick inside it is a button of its own
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
      // each note in its own colour, darkened for the lift — never grey under a coloured card
      style={paperStyle(paper)}
      className={`milo-paper milo-lift flex w-full cursor-pointer gap-3 rounded-xl border px-3 py-3 text-left ${
        selected ? "border-foreground/60" : "border-foreground/10"
      }`}
    >
      {onToggleSelect && (
        <SelectBox checked={selected} onToggle={() => onToggleSelect(note.id)} />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {note.title?.trim() ? <Highlight text={note.title} query={query} /> : "Untitled"}
          </span>
          {found ? (
            <MatchCount count={found.count} />
          ) : (
            <span className="shrink-0 text-[11px] text-foreground/30 tabular-nums">
              {dated ? date(note.createdAt) : clock(note.createdAt)}
            </span>
          )}
        </div>

        {block && (
          <span
            className="mt-1 inline-flex rounded-md px-1.5 py-0.5 text-[10px]"
            style={{ backgroundColor: block.bg, color: block.ink }}
          >
            {block.name.replace(" Block", "")}
          </span>
        )}

        {found ? (
          <MatchLines found={found} className="pt-1.5" />
        ) : (
          note.text && (
            <p className="line-clamp-2 break-words pt-1 text-xs leading-relaxed text-foreground/45">
              {note.text}
            </p>
          )
        )}
      </div>
    </div>
  );
}
