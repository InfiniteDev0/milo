"use client";

// How many notes a task has, as a quiet mark on its card. Nothing when there are none.

import { NotebookPen } from "lucide-react";
import { useNotes } from "./notes-provider";

export function useTaskNoteCount(taskId) {
  const { notes } = useNotes();
  return notes.filter((n) => n.taskId === taskId).length;
}

export function TaskNoteCount({ count, className = "" }) {
  if (count === 0) return null;

  return (
    <span
      title={`${count} ${count === 1 ? "note" : "notes"}`}
      className={`pointer-events-none flex shrink-0 items-center gap-1 text-[11px] text-foreground/40 tabular-nums ${className}`}
    >
      <NotebookPen className="size-3" />
      {count}
    </span>
  );
}
