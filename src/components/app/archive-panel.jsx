"use client";

/* The archive. Ctrl + Shift + A.
 *
 * Blocks that aren't in play today live here. You decide how many blocks a day
 * holds; the rest wait out of sight rather than sitting in the lineup asking
 * to be done.
 *
 * Deliberately keeps no score: no count badge, no "archived 3 weeks ago", no
 * nudge to clear it out. An archive that keeps score is an overdue list with a
 * nicer name. Bringing something back is one click.
 */

import { useEffect, useState } from "react";
import { Archive, Undo2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBlocks } from "./blocks-provider";

export function ArchivePanel() {
  const { archived, restoreBlock, countsFor } = useBlocks();
  const [open, setOpen] = useState(false);

  /* The button lives in the day header and the panel lives in the shell,
     so they cannot pass a prop between them. One event, no shared parent,
     and the shortcut keeps working exactly as it did. */
  useEffect(() => {
    const open = () => setOpen(true);
    window.addEventListener("milo:archive", open);
    return () => window.removeEventListener("milo:archive", open);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      /* Ctrl+Shift+A, not Ctrl+A. Plain Ctrl+A is select-all and the note
         editor needs it — a shortcut that only works when you're not writing
         is a shortcut that fails exactly when you reach for it. */
      if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;
      if (e.key.toLowerCase() !== "a") return;

      /* Ctrl+A is select-all. Only steal it when nobody is typing — otherwise
         the shortcut breaks text selection in every input in the app. */
      const el = document.activeElement;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);
      if (typing) return;

      e.preventDefault();
      setOpen((v) => !v);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left">Archive</DialogTitle>
          <DialogDescription className="text-left">
            Blocks that aren&apos;t in your lineup right now. Bring one back
            whenever you want it.
          </DialogDescription>
        </DialogHeader>

        {archived.length === 0 ? (
          <p className="rounded-lg border border-dashed border-black/12 px-3 py-8 text-center text-sm text-black/35">
            Nothing archived.
          </p>
        ) : (
          <ul className="flex max-h-72 list-none flex-col gap-2 overflow-y-auto p-0">
            {archived.map((b) => {
              const counts = countsFor(b.id);
              const total = counts.todo + counts.doing + counts.done;

              return (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                  style={{ background: b.bg, color: b.ink }}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">
                      {b.name.replace(" Block", "")}
                    </span>
                    <span className="text-xs opacity-60">
                      {total === 0
                        ? "Nothing in it"
                        : `${total} ${total === 1 ? "task" : "tasks"}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => restoreBlock(b.id)}
                    className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-black/10 px-3 py-1.5 text-xs transition-colors hover:bg-black/20"
                  >
                    <Undo2 className="size-3.5" />
                    Bring back
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-center text-xs text-black/30">
          Ctrl + Shift + A to open and close this
        </p>
      </DialogContent>
    </Dialog>
  );
}

/* The way in that isn't a keyboard shortcut. A feature reachable only by
   Ctrl+Shift+A is a feature almost nobody finds. */
export function ArchiveButton() {
  const { archived } = useBlocks();
  if (archived.length === 0) return null;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("milo:archive"))}
      title="Blocks you keep but aren't running today"
      className="flex h-9 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm text-black/45 transition-colors hover:bg-black/5 hover:text-black"
    >
      <Archive className="size-4" />
      {archived.length}
    </button>
  );
}
