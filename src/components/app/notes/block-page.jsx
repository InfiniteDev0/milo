"use client";

// Every note that belongs to one block — or to the day — spread as cards, with the same tools as All notes.

import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { useBlocks } from "../blocks-provider";
import { useNotes } from "../notes-provider";
import { CardsView } from "./cards-view";
import { NoteSheet } from "./note-sheet";
import { BlockPageSkeleton } from "./skeletons";
import { useNoteSheet } from "./use-note-sheet";

export function BlockNotesPage({ blockId }) {
  const { blocks, droppedToday, archived, hydrated: blocksReady } = useBlocks();
  const { notes, hydrated, loadFailed, canWrite, addNote } = useNotes();
  const sheet = useNoteSheet();

  const everyBlock = [...blocks, ...droppedToday, ...archived];
  const known = new Set(everyBlock.map((b) => b.id));
  const isDay = blockId === "day";
  const block = isDay ? null : everyBlock.find((b) => b.id === blockId) ?? null;

  // a day note has no block, or a block that no longer exists
  const mine = notes.filter((n) =>
    isDay ? !n.blockId || !known.has(n.blockId) : n.blockId === blockId,
  );

  const name = block ? block.name.replace(" Block", "") : "Day notes";
  const ready = hydrated && blocksReady;
  const missing = !isDay && ready && !block;

  const add = () => {
    const fresh = addNote({ blockId: isDay ? null : blockId });
    if (fresh) sheet.openNote(fresh);
  };

  // blocks and notes both, or the page draws once without its block
  if (!ready && !loadFailed) return <BlockPageSkeleton />;

  return (
    <div className="flex h-full flex-col px-6 pt-5 lg:px-8">
      <Link
        href="/notes"
        className="flex w-fit items-center gap-1 pb-3 text-sm text-foreground/45 transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Notes
      </Link>

      {missing ? (
        <p className="pt-16 text-center text-sm text-foreground/45">
          This block isn&rsquo;t here any more. Its notes are with your Day notes.
        </p>
      ) : (
        <>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pb-4">
            <div className="flex items-center gap-3">
              <span
                className={`rounded-lg px-3 py-1.5 text-lg font-medium ${
                  block ? "" : "bg-card text-foreground ring-1 ring-foreground/10"
                }`}
                style={block ? { backgroundColor: block.bg, color: block.ink } : undefined}
              >
                {name}
              </span>
              <span className="text-sm text-foreground/45 tabular-nums">
                {mine.length} {mine.length === 1 ? "note" : "notes"}
              </span>
            </div>

            {canWrite && (
              <button
                type="button"
                onClick={add}
                style={{ "--lift": "var(--solid-lift)" }}
                className="milo-lift flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-solid px-4 text-sm text-solid-ink hover:bg-solid-hover"
              >
                <Plus className="size-4" />
                Add note
              </button>
            )}
          </div>

          <div className="scrollbar-pill min-h-0 flex-1 overflow-y-auto pb-8">
            {loadFailed ? (
              // a failed read knows nothing about your notes, so it never says there are none
              <p className="pt-16 text-center text-sm text-foreground/45">
                Couldn&rsquo;t reach your notes. Nothing you wrote is gone.
              </p>
            ) : (
              <CardsView notes={mine} onOpen={sheet.openNote} empty="No notes here yet." />
            )}
          </div>
        </>
      )}

      <NoteSheet sheet={sheet} />
    </div>
  );
}
