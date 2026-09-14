"use client";

// Notes grouped by the block each belongs to, then a card for notes that belong to the day.

import { useBlocks } from "../blocks-provider";
import { BlockNotes } from "./block-notes";

export function ByBlock({ notes, canWrite, onOpen, onAdd }) {
  const { blocks, archived } = useBlocks();

  // a set-aside block still gets its card while notes belong to it
  const shelved = archived.filter((b) => notes.some((n) => n.blockId === b.id));
  const cards = [...blocks, ...shelved];
  const known = new Set(cards.map((b) => b.id));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((b) => (
        <BlockNotes
          key={b.id}
          block={b}
          notes={notes.filter((n) => n.blockId === b.id)}
          canWrite={canWrite}
          onOpen={onOpen}
          onAdd={() => onAdd(b.id)}
        />
      ))}

      <BlockNotes
        block={null}
        notes={notes.filter((n) => !n.blockId || !known.has(n.blockId))}
        canWrite={canWrite}
        onOpen={onOpen}
        onAdd={() => onAdd(null)}
      />
    </div>
  );
}
