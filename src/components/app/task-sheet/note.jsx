"use client";

// A task's notes: real notes, with the same editor as everywhere else, and kept on the Notes page too.
// Text from the old note box is shown until you turn it into a note, so nothing written before is lost.

import { NotebookPen, Plus } from "lucide-react";
import { textToHtml } from "@/lib/text-to-html";
import { useBlocks } from "../blocks-provider";
import { useNotes } from "../notes-provider";

const when = (ms) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export function Note({ task, onOpenNote }) {
  const { setTaskNote } = useBlocks();
  const { notes, canWrite, addNote } = useNotes();

  const mine = notes.filter((n) => n.taskId === task.id).sort((a, b) => b.createdAt - a.createdAt);
  const earlier = task.note?.trim();

  // filed under the task's block, so it shows with that block's notes as well
  const write = (fields = {}) => {
    const fresh = addNote({ taskId: task.id, blockId: task.blockId, title: task.name, ...fields });
    if (fresh) onOpenNote(fresh.id);
    return fresh;
  };

  const convert = () => {
    if (write({ body: textToHtml(task.note) })) setTaskNote(task.id, "");
  };

  return (
    <div className="flex flex-col gap-2 border-t border-foreground/5 pt-3">
      <span className="text-xs text-foreground/45">Notes</span>

      {mine.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => onOpenNote(n.id)}
          className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left ring-1 ring-foreground/10 transition-colors hover:bg-foreground/4"
        >
          <NotebookPen className="size-3.5 shrink-0 text-foreground/40" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{n.title?.trim() || "Untitled"}</span>
            {n.text && <span className="block truncate text-xs text-foreground/45">{n.text}</span>}
          </span>
          <span className="shrink-0 text-[11px] text-foreground/35 tabular-nums">{when(n.createdAt)}</span>
        </button>
      ))}

      {earlier && (
        <div className="flex flex-col gap-2 rounded-lg bg-foreground/4 px-3 py-2.5">
          <p className="line-clamp-4 whitespace-pre-line break-words text-sm text-foreground/65">{task.note}</p>
          {canWrite && (
            <button
              type="button"
              onClick={convert}
              className="w-fit cursor-pointer rounded-md px-2 py-1 text-xs text-foreground/60 ring-1 ring-foreground/10 transition-colors hover:text-foreground"
            >
              Turn into a note
            </button>
          )}
        </div>
      )}

      {canWrite && (
        <button
          type="button"
          onClick={() => write()}
          className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-foreground/55 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <Plus className="size-3.5" />
          Write a note
        </button>
      )}
    </div>
  );
}
