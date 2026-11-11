"use client";

/* One note as a card, laid out like the reference: a cover filling the top — the
   note's cover picture, or else its own words blurred on its paper — then its title, its block, and how
   long since it was last touched. While searching, the cover shows the lines the
   words turn up in instead, so you can see why it matched.

   On hover, these appear over the cover: the tick that selects it, top left; the
   star (Favorite), top right; and Add cover (or Change cover, with a remove
   beside it), bottom right. A cover is a picture shrunk to 800px WebP and saved
   on the note (notes.cover, migration 0015); before 0015 Add cover still shows,
   and says what it's waiting for. Once any card is selected the ticks stay
   showing, and Ctrl/⌘- or Shift-click selects too. Every card is the same height. */

import { useRef } from "react";
import { ImagePlus, Star, X } from "lucide-react";
import { toast } from "sonner";
import { shrinkImage } from "@/lib/shrink-image";
import { noteColour, paperStyle } from "@/lib/note-colours";
import { timeAgo } from "@/lib/time-ago";
import { cn } from "@/lib/utils";
import { useBlocks } from "../blocks-provider";
import { findInNote } from "@/lib/note-search";
import { Highlight, MatchLines } from "./highlight";
import { SelectBox } from "./select-box";

// selecting: some card is selected, so every tick stays showing
// the drag a card carries onto a category in the side panel: the ids of the notes it moves
export const NOTES_DRAG = "application/x-milo-notes";

// the blurred cover of a note with nothing in it yet
const FILLER =
  "A few lines about the day, what came up and what got done.\nSome of it in order, most of it not.\n\nThe part worth keeping, the part to come back to, and a list:\nthe first thing, the next thing, the one after that.";

// a small dark box over the cover, for its buttons
const OVER = "flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-black/80 px-2.5 text-xs font-medium text-white transition-colors hover:bg-black";

// dragIds: the notes a drag of this card carries. onCover(note, dataUrl | null): set or remove its cover
export function NoteCard({ note, query = "", selected = false, selecting = false, onToggleSelect, onOpen, onTogglePin, onCover, dragIds }) {
  const picker = useRef(null);
  // a cover can only be kept once the database has the column for it (note.cover is undefined before 0015)
  const canCover = Boolean(onCover);
  const coverReady = note.cover !== undefined;
  const takeCover = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    try {
      const src = await shrinkImage(file, 800);
      if (src) onCover(note, src);
    } catch {
      // a file the browser can't draw just isn't taken
    }
  };
  const { blocks, droppedToday, archived } = useBlocks();
  const block = note.blockId ? [...blocks, ...droppedToday, ...archived].find((b) => b.id === note.blockId) : null;
  const paper = noteColour(note.colour);
  // searching: the lines the words are in, shown in place of the cover
  const found = query.trim() ? findInNote(note, query, 6) : null;
  const searching = Boolean(found?.lines.length);

  return (
    // a div, not a button: the star inside it is a button of its own
    <div
      role="button"
      tabIndex={0}
      draggable={Boolean(dragIds)}
      onDragStart={(e) => {
        e.dataTransfer.setData(NOTES_DRAG, JSON.stringify(dragIds()));
        e.dataTransfer.effectAllowed = "move";
      }}
      // while selecting, a click selects; Ctrl/⌘ or Shift selects any time
      onClick={(e) => (selecting || e.metaKey || e.ctrlKey || e.shiftKey ? onToggleSelect?.(note.id) : onOpen(note))}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(note);
        }
      }}
      className={cn(
        // only the footer has an edge at rest; a selected card is ringed
        "group/note flex h-72 cursor-pointer flex-col overflow-hidden rounded-lg bg-card text-left transition-shadow",
        selected && "ring-2 ring-(--theme-accent)",
      )}
    >
      {/* the cover; plain paper is white in light mode, the same as the footer, so it takes a soft grey there */}
      <div
        className="milo-paper relative min-h-0 flex-1 overflow-hidden"
        style={{ ...paperStyle(paper), ...(paper.id === "plain" && { "--paper": "color-mix(in srgb, var(--foreground) 5%, var(--card))" }) }}
      >
        {searching ? (
          <div className="absolute inset-0 overflow-hidden p-4 pt-12">
            <MatchLines found={found} />
          </div>
        ) : note.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={note.cover} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
        ) : (
          // no cover: its own words, blurred, as the cover (a page of writing while it's empty)
          <p aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden p-4 text-[13px] leading-relaxed whitespace-pre-line text-foreground/60 blur-[2.5px] select-none">
            {note.text?.trim() || FILLER}
          </p>
        )}

        {/* on hover, bottom right: Add cover, or Change cover with a remove beside it */}
        {canCover && (
          <span
            onClick={(e) => e.stopPropagation()}
            className="absolute right-3 bottom-3 flex items-center gap-1.5 opacity-0 transition-opacity group-hover/note:opacity-100 focus-within:opacity-100"
          >
            <input ref={picker} type="file" accept="image/*" hidden onChange={(e) => takeCover(e.target.files?.[0])} />
            <button
              type="button"
              onClick={() => (coverReady ? picker.current?.click() : toast("Covers switch on once migration 0015 is run in Supabase."))}
              className={OVER}
            >
              <ImagePlus className="size-3.5" />
              {note.cover ? "Change cover" : "Add cover"}
            </button>
            {note.cover && (
              <button type="button" onClick={() => onCover(note, null)} aria-label="Remove cover" className={cn(OVER, "w-7 justify-center px-0")}>
                <X className="size-3.5" />
              </button>
            )}
          </span>
        )}

        {/* on hover: the tick (it stays while selecting), and the star */}
        <span
          className={cn(
            "absolute left-3 top-3 flex items-center gap-2 transition-opacity",
            selected || selecting ? "opacity-100" : "opacity-0 group-hover/note:opacity-100",
          )}
        >
          {onToggleSelect && <SelectBox checked={selected} onToggle={() => onToggleSelect(note.id)} className="bg-black/60" />}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note);
          }}
          aria-pressed={!!note.pinned}
          aria-label={note.pinned ? "Remove from Favorite" : "Add to Favorite"}
          className="absolute right-3 top-3 flex size-7 cursor-pointer items-center justify-center rounded-md bg-black/80 opacity-0 transition-opacity group-hover/note:opacity-100 focus-visible:opacity-100"
        >
          <Star className={cn("size-3.5", note.pinned ? "text-[#f5c542]" : "text-white")} fill={note.pinned ? "currentColor" : "none"} />
        </button>
      </div>

      {/* title, block, and when: the one part with an edge (sides and bottom), so it doesn't melt into the page */}
      <div className={cn("flex shrink-0 flex-col gap-2 rounded-b-lg border border-t-0 px-4 py-3", selected ? "border-transparent" : "border-foreground/10")}>
        <h3 className="truncate text-base font-medium">{note.title?.trim() ? <Highlight text={note.title} query={query} /> : "Untitled"}</h3>
        <div className="flex items-center justify-between gap-2">
          {block ? (
            // the block's own colour, solid, with its own ink — no border
            <span className="truncate rounded-sm px-2 py-0.5 text-xs font-medium" style={{ background: block.bg, color: block.ink }}>
              {block.name.replace(" Block", "")}
            </span>
          ) : (
            <span className="rounded-sm bg-foreground/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">Day note</span>
          )}
          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(note.updatedAt ?? note.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
