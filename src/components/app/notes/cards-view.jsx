"use client";

// Notes as cards with their tools: search every word, narrow by date, tick to move or delete.
// The All notes view and a block's own page both use it. The tools stay put; only the notes scroll.

import { useState } from "react";
import { filterNotes } from "@/lib/note-filters";
import { summarise } from "@/lib/note-search";
import { useNow } from "@/lib/time";
import { useNotes } from "../notes-provider";
import { Filters } from "./filters";
import { MatchSummary } from "./highlight";
import { NotesGrid } from "./notes-grid";
import { SelectionBar } from "./selection-bar";
import { useSelection } from "./use-selection";

export function CardsView({ notes, onOpen, empty, onAdd }) {
  const { editNote, moveNotes, removeNotes } = useNotes();
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("all");
  const now = useNow(true, 60000);

  const shown = filterNotes(notes, { query, range, now });
  const summary = query.trim() ? summarise(shown, query) : null;
  const { selected, toggle, clear } = useSelection(new Set(shown.map((n) => n.id)));
  const filtering = query.trim() !== "" || range !== "all";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-col gap-2">
        <Filters query={query} onQuery={setQuery} range={range} onRange={setRange} />
        {summary && summary.hits > 0 && (
          <p className="text-xs text-foreground/45">
            <MatchSummary {...summary} />
          </p>
        )}
      </div>

      {selected.size > 0 && (
        <div className="shrink-0">
          <SelectionBar
            count={selected.size}
            onMove={(block) => {
              moveNotes([...selected], block);
              clear();
            }}
            onDelete={() => {
              removeNotes([...selected]);
              clear();
            }}
            onClear={clear}
          />
        </div>
      )}

      {/* -mx-2 lets the grid's own padding show a selected card's ring without shifting the cards */}
      <div className="scrollbar-pill -mx-2 min-h-0 flex-1 overflow-y-auto pb-8">
        <NotesGrid
          notes={shown}
          query={query}
          selected={selected}
          onToggleSelect={toggle}
          onOpen={onOpen}
          onTogglePin={(n) => editNote(n.id, { pinned: !n.pinned })}
          empty={filtering ? "No notes match that." : empty}
          // a new note doesn't answer a search, so the nudge waits until the filters are off
          onAdd={filtering ? undefined : onAdd}
        />
      </div>
    </div>
  );
}
