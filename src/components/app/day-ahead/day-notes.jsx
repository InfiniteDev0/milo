"use client";

// Notes for the day itself rather than one block: written today, or left for tomorrow.

import { notesOn } from "@/lib/day-ahead";
import { useBlocks } from "../blocks-provider";
import { useNotes } from "../notes-provider";
import { NoteLines } from "./note-lines";

export function DayNotes({ stamp, ahead, onOpenNote }) {
  const { lineup } = useBlocks();
  const { notes, canWrite, addNote } = useNotes();

  const mine = notesOn(notes, stamp, null, new Set(lineup.map((b) => b.id)));

  const leaveNote = () => {
    const fresh = addNote({ showOn: ahead ? stamp : null });
    if (fresh) onOpenNote(fresh.id);
  };

  return (
    <div className="border-t border-foreground/8 pt-4">
      <NoteLines
        title={ahead ? "Notes for tomorrow" : "Notes for today"}
        notes={mine}
        onOpen={onOpenNote}
        onAdd={canWrite ? leaveNote : null}
        addLabel={ahead ? "Leave a note for tomorrow" : "Note about today"}
      />
    </div>
  );
}
