"use client";

// The Notes page sheet: one block's notes and an open note, two slides like the notes sheet.
// Back from a note lands on the list of the block you opened it from.

import { useEffect, useRef, useState } from "react";
import { GROW_TRANSITION, PANE_WIDTH, Sheet } from "@/components/ui/sheet";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useBlocks } from "../blocks-provider";
import { useNotes } from "../notes-provider";
import { ListPage } from "../tray/list-page";
import { NotePage } from "../tray/note-page";
import { SheetGrip } from "../tray/sheet-grip";
import { ScopePicker, scopeName } from "./scope-picker";
import { useSheetPosition } from "@/hooks/use-sheet-position";

export function NoteSheet({ sheet }) {
  const { state, showNote, back, close, toggleFull, setScope } = sheet;
  const { notes } = useNotes();
  // on for every note clicked on the page, and only ever widens around an open note
  const full = state.full;
  // the same place as the notes sheet on the day page
  const position = useSheetPosition();
  const onNote = state.page === "note" && notes.some((n) => n.id === state.noteId);

  return (
    <Sheet
      // full screen always grows from the right, up to the nav rail
      side={full && onNote ? "right" : position}
      // it floats: clicking another card changes the note instead of closing the sheet
      floating
      open={state.open}
      onOpenChange={(o) => !o && close()}
      // the transition stays on both ways, so shrinking back glides like growing does
      style={{ transition: GROW_TRANSITION, ...(full && onNote ? { width: PANE_WIDTH } : {}) }}
    >
      <SheetGrip position={position} />
      <Slides
        state={state}
        onShow={showNote}
        onBack={back}
        onScope={setScope}
        full={full}
        onToggleFull={toggleFull}
      />
    </Sheet>
  );
}

function Slides({ state, onShow, onBack, onScope, full, onToggleFull }) {
  const { blocks, droppedToday, archived, hydrated: blocksReady } = useBlocks();
  const { notes, hydrated, loadFailed, canWrite, addNote, editNote, moveNotes, removeNotes } = useNotes();
  const [api, setApi] = useState(null);
  const landed = useRef(false);

  const everyBlock = [...blocks, ...droppedToday, ...archived];
  const known = new Set(everyBlock.map((b) => b.id));
  const block = everyBlock.find((b) => b.id === state.scope) ?? null;
  const list = notes.filter((n) =>
    block ? n.blockId === block.id : !n.blockId || !known.has(n.blockId),
  );
  const note = notes.find((n) => n.id === state.noteId) ?? null;
  // a note deleted while open falls back to its list
  const onNote = state.page === "note" && note !== null;
  const name = scopeName(block);

  // lands on the right slide the moment the sheet opens, then glides between them
  useEffect(() => {
    if (!api) return;
    api.scrollTo(onNote ? 1 : 0, !landed.current);
    landed.current = true;
  }, [api, onNote]);

  const add = () => {
    const fresh = addNote({ blockId: block?.id ?? null });
    if (fresh) onShow(fresh.id);
  };

  return (
    // watchDrag off: the slides move by button, not by dragging the sheet
    <Carousel setApi={setApi} opts={{ watchDrag: false }} className="flex min-h-0 flex-1 flex-col">
      {/* every link has to carry the height or h-full resolves against auto */}
      <CarouselContent
        insetClassName="flex min-h-0 flex-1 flex-col"
        viewportClassName="min-h-0 flex-1"
        className="h-full"
      >
        <CarouselItem className="h-full">
          <ListPage
            title={<ScopePicker block={block} onPick={onScope} />}
            notes={list}
            ready={hydrated && blocksReady}
            loadFailed={loadFailed}
            canWrite={canWrite}
            onAdd={add}
            onOpen={onShow}
            when="date"
            showBlock={false}
            searchLabel={`Search ${name}`}
            emptyText={block ? `No notes in ${name} yet.` : "No day notes yet."}
            onMove={moveNotes}
            onDelete={removeNotes}
          />
        </CarouselItem>

        <CarouselItem className="h-full">
          <NotePage
            note={note}
            onChange={(patch) => editNote(state.noteId, patch)}
            onBack={onBack}
            full={full}
            onToggleFull={onToggleFull}
          />
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
}
