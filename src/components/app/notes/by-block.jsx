"use client";

// Notes grouped by the block each belongs to, then a card for notes that belong to the day.
// Tick notes to move or delete them together, or drag them from one card onto another.

import { useState } from "react";
import { matchesSearch } from "@/lib/note-search";
import { useBlocks } from "../blocks-provider";
import { DragFollower, dragStart, hideDragImage } from "../drag-follower";
import { useNotes } from "../notes-provider";
import { BlockNotes, NOTE_DRAG } from "./block-notes";
import { NoteDragCard } from "./note-drag-card";
import { SelectionBar } from "./selection-bar";
import { useSelection } from "./use-selection";

export function ByBlock({ notes, canWrite, onOpen, onAdd }) {
  const { blocks, droppedToday, archived } = useBlocks();
  const { moveNotes, removeNotes } = useNotes();
  // each card keeps its own search
  const [queries, setQueries] = useState({});
  // where the drag began, the notes it carries, and the one under the pointer
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const dragIds = drag?.ids ?? null;

  const known = new Set([...blocks, ...droppedToday, ...archived].map((b) => b.id));
  const cardOf = (n) => (n.blockId && known.has(n.blockId) ? n.blockId : "day");
  // set aside today still counts; set aside for good gets a card only while notes belong to it
  const shelved = archived.filter((b) => notes.some((n) => n.blockId === b.id));
  const cards = [
    ...[...blocks, ...droppedToday, ...shelved].map((b) => ({
      key: b.id,
      block: b,
      href: `/notes/${b.id}`,
      notes: notes.filter((n) => n.blockId === b.id),
    })),
    { key: "day", block: null, href: "/notes/day", notes: notes.filter((n) => cardOf(n) === "day") },
  ];

  const visible = new Set(
    cards.flatMap((c) => c.notes.filter((n) => matchesSearch(n, queries[c.key])).map((n) => n.id)),
  );
  const { selected, toggle, clear } = useSelection(visible);

  const startDrag = (e, note) => {
    // a ticked note carries every ticked note with it
    const ids = selected.has(note.id) ? [...selected] : [note.id];
    e.dataTransfer.setData(NOTE_DRAG, ids.join(","));
    e.dataTransfer.effectAllowed = "move";
    hideDragImage(e);
    setDrag({ ...dragStart(e), ids, note });
  };

  const endDrag = () => {
    setDrag(null);
    setOver(null);
  };

  const drop = (card, data) => {
    endDrag();
    // dropping a note on the card it already sits in changes nothing
    const ids = data.split(",").filter((id) => {
      const n = notes.find((x) => x.id === id);
      return n && cardOf(n) !== card.key;
    });
    if (ids.length === 0) return;
    moveNotes(ids, card.block);
    if (ids.some((id) => selected.has(id))) clear();
  };

  return (
    <>
      {selected.size > 0 && (
        <div className="sticky top-0 z-10 px-2 pb-2">
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

      <div className="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => {
          // only a card the carried notes would actually move into opens a slot
          const accepts = dragIds != null && dragIds.some((id) => !c.notes.some((n) => n.id === id));

          return (
            <BlockNotes
              key={c.key}
              block={c.block}
              href={c.href}
              notes={c.notes}
              query={queries[c.key] ?? ""}
              onQuery={(q) => setQueries((prev) => ({ ...prev, [c.key]: q }))}
              canWrite={canWrite}
              selected={selected}
              onToggleSelect={toggle}
              onOpen={onOpen}
              onAdd={() => onAdd(c.block?.id ?? null)}
              dragIds={dragIds}
              over={over === c.key && accepts}
              onDragStart={startDrag}
              onDragEnd={endDrag}
              onDragOver={() => setOver(c.key)}
              onDragLeave={() => setOver((o) => (o === c.key ? null : o))}
              onDrop={(data) => drop(c, data)}
            />
          );
        })}
      </div>

      <DragFollower start={drag} onEnd={endDrag}>
        {drag && <NoteDragCard note={drag.note} count={drag.ids.length} />}
      </DragFollower>
    </>
  );
}
