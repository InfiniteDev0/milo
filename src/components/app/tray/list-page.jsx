"use client";

// Slide 0: a list of notes — today's in the notes sheet, one block's on the Notes page.
// Carries the sheet's own title and close — the note slide has its own.

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { matchesSearch, summarise } from "@/lib/note-search";
import { MatchSummary } from "../notes/highlight";
import { SelectionBar } from "../notes/selection-bar";
import { NoteRowsSkeleton } from "../notes/skeletons";
import { useSelection } from "../notes/use-selection";
import { Empty } from "./empty";
import { NoteRow } from "./note-row";
import { Search } from "./search";

export function ListPage({
  notes,
  onAdd,
  onOpen,
  ready,
  loadFailed,
  canWrite,
  title = "Today’s notes",
  searchLabel,
  emptyText,
  when = "time",
  // the start of today: a note from before it shows its date, not a time
  since = null,
  showBlock = true,
  // passing these turns on ticking notes to move or delete them
  onMove,
  onDelete,
  // passing this splits the list into Today and Earlier
  todayIds = null,
}) {
  const [query, setQuery] = useState("");
  const selectable = canWrite && onMove != null && onDelete != null;

  // search reads the whole note, not just the lines a card shows
  const shown = notes.filter((n) => matchesSearch(n, query));
  const summary = query.trim() ? summarise(shown, query) : null;
  const { selected, toggle, clear } = useSelection(new Set(shown.map((n) => n.id)));

  const row = (n) => (
    <NoteRow
      key={n.id}
      note={n}
      onOpen={onOpen}
      query={query}
      when={when}
      since={since}
      showBlock={showBlock}
      selected={selected.has(n.id)}
      onToggleSelect={selectable ? toggle : undefined}
    />
  );

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-4 pb-3">
        <DialogPrimitive.Title className="min-w-0 truncate text-xl font-medium">{title}</DialogPrimitive.Title>

        <div className="flex shrink-0 items-center gap-2">
          {canWrite && notes.length > 0 && (
            <button
              type="button"
              onClick={onAdd}
              aria-label="New note"
              style={{ "--lift": "var(--chrome-lift)" }}
              className="milo-lift flex size-9 cursor-pointer items-center justify-center rounded-xl bg-chrome text-chrome-ink"
            >
              <Plus className="size-4" />
            </button>
          )}

          <DialogPrimitive.Close
            aria-label="Close"
            style={{ "--lift": "var(--card-lift)" }}
            className="milo-lift flex size-9 cursor-pointer items-center justify-center rounded-xl border border-foreground/10 bg-card text-foreground/50 transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
      </div>

      {loadFailed ? (
        // a failed read knows nothing about your notes, so it never says there are none
        <p className="px-8 pt-10 text-center text-sm text-foreground/45">
          Couldn&rsquo;t reach your notes. Nothing you wrote is gone.
        </p>
      ) : !ready ? (
        <NoteRowsSkeleton />
      ) : notes.length === 0 ? (
        <div className="min-h-0 flex-1 pb-8">
          <Empty onAdd={onAdd} text={emptyText} />
        </div>
      ) : (
        <>
          {selectable && selected.size > 0 && (
            <div className="shrink-0 px-5 pb-3">
              <SelectionBar
                count={selected.size}
                onMove={(block) => {
                  onMove([...selected], block);
                  clear();
                }}
                onDelete={() => {
                  onDelete([...selected]);
                  clear();
                }}
                onClear={clear}
              />
            </div>
          )}

          {summary && summary.hits > 0 && (
            <p className="shrink-0 px-5 pb-2 text-xs text-foreground/45">
              <MatchSummary {...summary} />
            </p>
          )}

          {/* pb-24 clears the floating search so the last note is never under it */}
          <div className="scrollbar-pill flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-5 pb-24">
            {shown.length === 0 ? (
              <p className="pt-8 text-center text-sm text-foreground/35">Nothing matches that.</p>
            ) : todayIds ? (
              <Sections
                today={shown.filter((n) => todayIds.has(n.id))}
                earlier={shown.filter((n) => !todayIds.has(n.id))}
                searching={query.trim() !== ""}
                row={row}
              />
            ) : (
              shown.map(row)
            )}
          </div>

          <Search value={query} onChange={setQuery} label={searchLabel} />
        </>
      )}
    </div>
  );
}

// Today's notes first, then everything older in the same place; an empty today still says so while nothing is searched
function Sections({ today, earlier, searching, row }) {
  return (
    <>
      {(today.length > 0 || !searching) && <Label>Today</Label>}
      {today.length > 0
        ? today.map(row)
        : !searching && <p className="pb-2 text-sm text-foreground/35">Nothing yet today.</p>}
      {earlier.length > 0 && <Label>Earlier</Label>}
      {earlier.map(row)}
    </>
  );
}

function Label({ children }) {
  return <p className="pt-1 text-xs font-medium tracking-wide text-foreground/40 uppercase">{children}</p>;
}
