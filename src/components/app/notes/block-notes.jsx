"use client";

// One block's notes on the block view: its name (which opens its page), a search, a + that files a new
// note straight into it, and the list. Notes drag from one card and drop on another.

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { findInNote, summarise } from "@/lib/note-search";
import { Highlight, MatchCount, MatchLines, MatchSummary } from "./highlight";
import { SelectBox } from "./select-box";

export const NOTE_DRAG = "application/milo-note";

const day = (ms) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export function BlockNotes({
  block,
  href,
  notes,
  query,
  onQuery,
  canWrite,
  selected,
  onToggleSelect,
  onOpen,
  onAdd,
  dragIds,
  over,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  const [searching, setSearching] = useState(false);

  const name = block ? block.name.replace(" Block", "") : "Day notes";
  const searched = query.trim() !== "";
  const results = notes
    .map((n) => ({ note: n, found: findInNote(n, query, 2) }))
    .filter((r) => !searched || r.found);
  const summary = searched ? summarise(notes, query) : null;
  // the block's own colour marks where the note will land
  const ring = block ? block.bg : "color-mix(in oklab, currentColor 35%, transparent)";

  return (
    <section
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(NOTE_DRAG)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver();
      }}
      onDragLeave={(e) => {
        // moving between the rows inside still counts as over the card
        if (!e.currentTarget.contains(e.relatedTarget)) onDragLeave();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(e.dataTransfer.getData(NOTE_DRAG));
      }}
      style={over ? { boxShadow: `inset 0 0 0 2px ${ring}` } : undefined}
      className="flex min-h-72 flex-col gap-3 rounded-2xl bg-foreground/4 p-4 transition-shadow"
    >
      <div className="flex items-center justify-between gap-2">
        <Link
          href={href}
          title={`All of ${name}`}
          className={`truncate rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-80 ${
            block ? "" : "bg-card text-foreground ring-1 ring-foreground/10"
          }`}
          style={block ? { backgroundColor: block.bg, color: block.ink } : undefined}
        >
          {name}
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          {/* an empty card has nothing to search */}
          {notes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearching((v) => !v);
                onQuery("");
              }}
              aria-pressed={searching}
              aria-label={`Search ${name}`}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-foreground/15 text-foreground/60 transition-colors hover:text-foreground"
            >
              <Search className="size-4" />
            </button>
          )}

          {canWrite && (
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Add a note to ${name}`}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-solid text-solid-ink hover:bg-solid-hover"
            >
              <Plus className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-foreground/45">
        <span className="min-w-0 truncate">
          {summary && summary.hits > 0 ? (
            <MatchSummary {...summary} />
          ) : block ? (
            "All notes in this block"
          ) : (
            "Notes that belong to the day"
          )}
        </span>
        <span className="shrink-0 tabular-nums">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </span>
      </div>

      {searching && notes.length > 0 && (
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={`Search ${name}`}
          aria-label={`Search ${name}`}
          className="h-9 rounded-lg border border-foreground/10 bg-card px-3 text-sm outline-none focus:border-foreground/30"
        />
      )}

      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {/* where the carried note will land */}
        {over && (
          <li
            className="flex h-11 items-center justify-center rounded-lg border-2 border-dashed text-xs text-foreground/45"
            style={{ borderColor: ring }}
          >
            Drop here
          </li>
        )}
        {results.length === 0 ? (
          !over && (
            <li className="py-6 text-center text-xs text-foreground/35">
              {searched ? "Nothing matches that." : "No notes here yet."}
            </li>
          )
        ) : (
          results.map(({ note: n, found }) => (
            <li key={n.id}>
              {/* a div, not a button: the tick inside is a button, and a button can't be dragged everywhere */}
              <div
                role="button"
                tabIndex={0}
                draggable={canWrite}
                onDragStart={(e) => onDragStart(e, n)}
                onDragEnd={onDragEnd}
                onClick={() => onOpen(n)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpen(n);
                  }
                }}
                title={canWrite ? "Click to open, drag to move" : undefined}
                // while carried, the row leaves a dotted outline where it was
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                  dragIds?.includes(n.id)
                    ? "border-dashed border-foreground/25 *:invisible"
                    : "border-transparent bg-card hover:bg-card/70"
                } ${selected.has(n.id) ? "ring-1 ring-foreground/40" : ""}`}
              >
                <SelectBox checked={selected.has(n.id)} onToggle={() => onToggleSelect(n.id)} />

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate">
                      {n.title?.trim() ? <Highlight text={n.title} query={query} /> : "Untitled"}
                    </span>
                    {found ? (
                      <MatchCount count={found.count} />
                    ) : (
                      <span className="shrink-0 text-[11px] text-foreground/35 tabular-nums">
                        {day(n.createdAt)}
                      </span>
                    )}
                  </span>
                  {found && <MatchLines found={found} className="pt-1" />}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
