"use client";

/* A block task's notes, in the notes sheet — the note icon on its card opens
   this instead of a box on the card. It opens straight onto the task's latest
   note, or a fresh one if it has none; back shows all the task's notes, with
   Write a note. Real notes, the same editor as everywhere else, kept on the
   Notes page too. */

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Sheet } from "@/components/ui/sheet";
import { useNotes } from "../notes-provider";
import { NotePage } from "../tray/note-page";
import { Note } from "../task-sheet/note";

// keyed on each opening, so it starts on the note it was opened for
export function NoteSheet({ task, initialNoteId = null, onClose }) {
  const { notes, editNote } = useNotes();
  // the note being read; null is the list of the task's notes
  const [noteId, setNoteId] = useState(initialNoteId);
  const note = notes.find((n) => n.id === noteId) ?? null;

  return (
    <Sheet open={task != null} onOpenChange={(o) => !o && onClose()} floating dismissible>
      <DialogPrimitive.Title className="sr-only">{task ? `Notes for ${task.name}` : "Notes"}</DialogPrimitive.Title>
      {task && note && (
        <NotePage note={note} onChange={(patch) => editNote(note.id, patch)} onBack={() => setNoteId(null)} />
      )}
      {task && !note && (
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center gap-2 px-5 py-4">
            <span className="min-w-0 flex-1 truncate text-lg font-medium">{task.name}</span>
            <DialogPrimitive.Close
              aria-label="Close"
              className="cursor-pointer rounded-lg p-1.5 opacity-50 transition-opacity hover:opacity-100"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="scrollbar-pill min-h-0 flex-1 overflow-y-auto px-5 pb-4">
            <Note task={task} onOpenNote={setNoteId} />
          </div>
        </div>
      )}
    </Sheet>
  );
}

// the note to land on: the task's latest, or a new one written there and then
export function openingNote(task, notes, addNote) {
  const mine = notes.filter((n) => n.taskId === task.id).sort((a, b) => b.createdAt - a.createdAt);
  if (mine[0]) return mine[0].id;
  return addNote({ taskId: task.id, blockId: task.blockId, title: task.name })?.id ?? null;
}
