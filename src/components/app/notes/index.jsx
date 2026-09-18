"use client";

// The Notes page: your notes grouped by block first, or every note as cards. Both open notes in one sheet.

import { useState } from "react";
import { Plus } from "lucide-react";
import { useBlocks } from "../blocks-provider";
import { useNotes } from "../notes-provider";
import { ByBlock } from "./by-block";
import { CardsView } from "./cards-view";
import { NoteSheet } from "./note-sheet";
import { BlockCardsSkeleton, NoteCardsSkeleton } from "./skeletons";
import { useNoteSheet } from "./use-note-sheet";

export function NotesView() {
  const { notes, hydrated, loadFailed, canWrite, addNote } = useNotes();
  // the cards need blocks as well as notes, or the page draws once as one Day notes card
  const { hydrated: blocksReady } = useBlocks();
  // block notes come first; the button switches to every note
  const [byBlock, setByBlock] = useState(true);
  const sheet = useNoteSheet();

  // `fields` carries the block when + is pressed on a block's card
  const add = (fields) => {
    const fresh = addNote(fields);
    if (fresh) sheet.openNote(fresh);
  };

  return (
    <div className="flex h-full flex-col px-6 pt-5 lg:px-8">
      <h1 className="shrink-0 pb-4 text-2xl">Notes</h1>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pb-4">
        <h2 className="text-lg">{byBlock ? "My Block Notes" : "All notes"}</h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setByBlock((v) => !v)}
            style={{ "--lift": "var(--solid-lift)" }}
            className="milo-lift flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-solid px-4 text-sm text-solid-ink hover:bg-solid-hover"
          >
            {byBlock ? "All notes" : "My Block Notes"}
          </button>

          {canWrite && (
            <button
              type="button"
              onClick={() => add()}
              style={{ "--lift": "var(--solid-lift)" }}
              className="milo-lift flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-solid px-4 text-sm text-solid-ink hover:bg-solid-hover"
            >
              <Plus className="size-4" />
              Add note
            </button>
          )}
        </div>
      </div>

      {/* the heading and buttons above stay put; only the notes below scroll */}
      <div className="flex min-h-0 flex-1 flex-col">
        {loadFailed ? (
          // a failed read knows nothing about your notes, so it never says there are none
          <p className="pt-16 text-center text-sm text-foreground/45">
            Couldn&rsquo;t reach your notes. Nothing you wrote is gone.
          </p>
        ) : !hydrated || !blocksReady ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            {byBlock ? <BlockCardsSkeleton /> : <NoteCardsSkeleton />}
          </div>
        ) : byBlock ? (
          <div className="scrollbar-pill min-h-0 flex-1 overflow-y-auto pb-8">
            <ByBlock
              notes={notes}
              canWrite={canWrite}
              onOpen={sheet.openNote}
              onAdd={(blockId) => add({ blockId })}
            />
          </div>
        ) : (
          <CardsView
            notes={notes}
            onOpen={sheet.openNote}
            onAdd={canWrite ? () => add() : undefined}
            empty="No notes yet. Anything you write lands here."
          />
        )}
      </div>

      <NoteSheet sheet={sheet} />
    </div>
  );
}
