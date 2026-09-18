"use client";

// One task, in full. Opened from the board and from the block sheet.

import { useState } from "react";
import { ChevronDown, Trash2, X } from "lucide-react";
import { MoveTaskMenu } from "../move-task-menu";
import { useNotes } from "../notes-provider";
import { NotePage } from "../tray/note-page";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Sheet } from "@/components/ui/sheet";
import { ACCENT, ACCENT_INK } from "@/lib/palette";
import { shade } from "@/lib/shade";
import { useBlocks } from "../blocks-provider";
import { Facts } from "./facts";
import { Schedule } from "./schedule";
import { Steps } from "./steps";
import { Note } from "./note";
import { StatusRow } from "./status-row";

export function TaskSheet({ taskId, onClose, onDismiss, beside = false }) {
  const { tasks, blockById, removeTask } = useBlocks();
  const { notes, editNote } = useNotes();
  // a note opened from this task; tied to the task, so another task never opens on it
  const [reading, setReading] = useState({ taskId: null, noteId: null });

  // Read live from the provider — a snapshot goes stale the moment you tick a step.
  const task = tasks.find((t) => t.id === taskId) ?? null;
  const block = task ? blockById[task.blockId] : null;
  const note =
    reading.taskId === taskId ? (notes.find((n) => n.id === reading.noteId) ?? null) : null;
  const openNote = (noteId) => setReading({ taskId, noteId });

  const steps = task?.steps ?? [];
  const ticked = steps.filter((x) => x.done).length;

  return (
    <Sheet
      // a task deleted from anywhere else takes its sheet with it, rather than leaving an empty one open
      open={task != null}
      onOpenChange={(o) => !o && onClose()}
      onDismiss={onDismiss}
      beside={beside}
      style={{ boxShadow: `0 24px 60px ${shade(ACCENT, 0.5)}33` }}
    >
      {task && block && note && (
        // the note, in place of the task; back returns to the task
        <NotePage
          note={note}
          onChange={(patch) => editNote(note.id, patch)}
          onBack={() => setReading({ taskId: null, noteId: null })}
        />
      )}

      {task && block && !note && (
        <>
          {/* Same header as the block sheet, in the task's colour instead of the block's. */}
          <div
            className="flex shrink-0 items-start gap-3 px-5 py-4"
            style={{ backgroundColor: ACCENT, color: ACCENT_INK }}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <DialogPrimitive.Title className="break-words text-lg font-medium">
                {task.name}
              </DialogPrimitive.Title>
              <span className="flex items-center text-xs opacity-60">
                {/* the block's name is where you move the task to another one */}
                <MoveTaskMenu
                  task={task}
                  align="start"
                  trigger={
                    <button
                      type="button"
                      title="Move to another block"
                      className="-mx-1.5 flex cursor-pointer items-center gap-0.5 rounded-md px-1.5 py-0.5 transition-colors hover:bg-white/15"
                    >
                      {block.name.replace(" Block", "")}
                      <ChevronDown className="size-3" />
                    </button>
                  }
                />
                {steps.length > 0 && (
                  <>
                    {" · "}
                    {ticked}/{steps.length} steps
                  </>
                )}
              </span>
            </div>

            {/* the sheet closes with the task; Undo in the toast brings both back */}
            <button
              type="button"
              onClick={() => {
                removeTask(task.id);
                onClose();
              }}
              aria-label={`Delete ${task.name}`}
              title="Delete task"
              className="shrink-0 cursor-pointer rounded-lg p-1.5 opacity-50 transition-opacity hover:opacity-100"
            >
              <Trash2 className="size-4" />
            </button>

            <DialogPrimitive.Close
              aria-label="Close"
              className="shrink-0 cursor-pointer rounded-lg p-1.5 opacity-50 transition-opacity hover:opacity-100"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          {/* the reason is the field that separates Milo from a task list */}
          {task.reason && (
            <p className="shrink-0 border-b border-foreground/8 px-5 py-3 text-xs text-foreground/50">
              {task.reason}
            </p>
          )}

          {/* scrollbar-pill or Windows draws its own track and arrows in here */}
          <div className="scrollbar-pill flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-5 py-4">
            <Facts task={task} />
            <Schedule task={task} />
            <Steps task={task} />
            <Note task={task} onOpenNote={openNote} />
          </div>

          {/* Outside the scroll region: status is what you came to change. */}
          <div className="shrink-0 border-t border-foreground/8 p-3">
            <StatusRow task={task} />
          </div>
        </>
      )}
    </Sheet>
  );
}
