"use client";

/* The Trash tab: notes you deleted, newest first. Each can go back where it
   was, or be deleted for good (with a few seconds of Undo); Empty Trash does
   that to all of them. Nothing leaves Trash on its own. Before migration 0015
   there is no Trash, and deletes are for good (after Undo), so it says that. */

import { RotateCcw, Trash2 } from "lucide-react";
import { timeAgo } from "@/lib/time-ago";
import { cn } from "@/lib/utils";
import { BOX } from "../view-header";

export function TrashView({ notes, ready, onRestore, onDelete }) {
  if (!ready) {
    return (
      <p className="px-5 pt-10 text-sm text-muted-foreground">
        Trash isn&rsquo;t switched on yet (it comes with migration 0015). Until then a deleted note can be brought back with Undo, for a few
        seconds after.
      </p>
    );
  }
  if (notes.length === 0) {
    return <p className="px-5 pt-10 text-sm text-muted-foreground">Trash is empty. Notes you delete wait here until you delete them for good.</p>;
  }

  const ordered = [...notes].sort((a, b) => b.deletedAt - a.deletedAt);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 px-5 py-3 text-sm text-muted-foreground">
        <span className="flex-1">
          {notes.length} {notes.length === 1 ? "note" : "notes"} in Trash. They stay until you delete them for good.
        </span>
        <button
          type="button"
          onClick={() => onDelete(notes.map((n) => n.id))}
          className={cn(BOX, "cursor-pointer gap-1.5 text-[#ef4444] transition-colors hover:bg-[#ef4444]/10")}
        >
          <Trash2 className="size-3.5" />
          Empty Trash
        </button>
      </div>

      <div className="scrollbar-pill min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map((n) => (
            <li key={n.id} className="flex flex-col gap-3 rounded-lg border border-foreground/10 bg-card p-4">
              <div className="min-w-0">
                <h3 className="truncate text-base font-medium">{n.title?.trim() || "Untitled"}</h3>
                <p className="text-xs text-muted-foreground">Deleted {timeAgo(n.deletedAt)}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => onRestore([n.id])} className={cn(BOX, "cursor-pointer gap-1.5 transition-colors hover:bg-muted")}>
                  <RotateCcw className="size-3.5" />
                  Restore
                </button>
                <button
                  type="button"
                  onClick={() => onDelete([n.id])}
                  className={cn(BOX, "cursor-pointer gap-1.5 text-muted-foreground transition-colors hover:bg-[#ef4444]/10 hover:text-[#ef4444]")}
                >
                  <Trash2 className="size-3.5" />
                  Delete for good
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
