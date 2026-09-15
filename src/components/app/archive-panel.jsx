"use client";

/* The archive. Ctrl + Shift + A.
 *
 * Blocks that aren't in play live here — the ones you keep but aren't running,
 * and the ones you set aside just for today. Both are the same idea, so they
 * share one door instead of one living in the lineup asking to be noticed.
 *
 * Deliberately keeps no score: no "archived 3 weeks ago", no nudge to clear it
 * out. An archive that keeps score is an overdue list with a nicer name.
 * Bringing something back is one click.
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
import { useShortcut } from "@/hooks/use-shortcut";
import { SET_ASIDE_KEY } from "@/lib/shortcuts";
import { useBlocks } from "./blocks-provider";

function Row({ block, onBack, counts }) {
  const total = counts.todo + counts.doing + counts.done;

  return (
    <li
      className="milo-on-tint flex items-center justify-between gap-3 rounded-xl px-4 py-3"
      style={{ background: block.bg, color: block.ink }}
    >
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">
          {block.name.replace(" Block", "")}
        </span>
        <span className="text-xs opacity-60">
          {total === 0 ? "Nothing in it" : `${total} ${total === 1 ? "task" : "tasks"}`}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onBack(block.id)}
        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-current/10 px-3 py-1.5 text-xs transition-colors hover:bg-current/20"
      >
        <Undo2 className="size-3.5" />
        Bring back
      </button>
    </li>
  );
}

function Group({ title, hint, blocks, onBack, countsFor }) {
  if (blocks.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-xs font-medium">{title}</h3>
        <p className="text-xs text-foreground/40">{hint}</p>
      </div>

      <ul className="flex list-none flex-col gap-2 p-0">
        {blocks.map((b) => (
          <Row key={b.id} block={b} onBack={onBack} counts={countsFor(b.id)} />
        ))}
      </ul>
    </section>
  );
}

export function ArchivePanel() {
  const { archived, droppedToday, restoreBlock, undropBlock, countsFor } = useBlocks();
  const [open, setOpen] = useState(false);

  /* The button lives in the day header and the panel lives in the shell,
     so they cannot pass a prop between them. One event, no shared parent,
     and the shortcut keeps working exactly as it did. */
  useEffect(() => {
    const open = () => setOpen(true);
    window.addEventListener("milo:archive", open);
    return () => window.removeEventListener("milo:archive", open);
  }, []);

  // Ctrl/⌘+Shift+A, not Ctrl+A: plain Ctrl+A is select-all, and the note editor needs it
  useShortcut(SET_ASIDE_KEY, () => setOpen((v) => !v));

  const nothing = archived.length === 0 && droppedToday.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left">Set aside</DialogTitle>
          <DialogDescription className="text-left">
            Blocks that aren&apos;t in your lineup right now. Bring one back
            whenever you want it.
          </DialogDescription>
        </DialogHeader>

        {nothing ? (
          <p className="rounded-lg border border-dashed border-foreground/12 px-3 py-8 text-center text-sm text-foreground/35">
            Nothing set aside.
          </p>
        ) : (
          <div className="flex max-h-80 flex-col gap-4 overflow-y-auto">
            {/* Today's first — it is the one you might want back in a minute. */}
            <Group
              title="Set aside today"
              hint="Back in the lineup for the rest of today."
              blocks={droppedToday}
              onBack={undropBlock}
              countsFor={countsFor}
            />

            <Group
              title="Kept for later"
              hint="Not in any day until you bring it back."
              blocks={archived}
              onBack={restoreBlock}
              countsFor={countsFor}
            />
          </div>
        )}

        <p className="text-center text-xs text-foreground/30">
          Ctrl + Shift + A to open and close this
        </p>
      </DialogContent>
    </Dialog>
  );
}

/* The way in that isn't a keyboard shortcut. A feature reachable only by
   Ctrl+Shift+A is a feature almost nobody finds. */
export function ArchiveButton() {
  const { archived, droppedToday } = useBlocks();
  const n = archived.length + droppedToday.length;
  if (n === 0) return null;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("milo:archive"))}
      title="Blocks you keep but aren't running today"
      className="flex h-9 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm text-foreground/45 transition-colors hover:bg-foreground/5 hover:text-foreground"
    >
      <Archive className="size-4" />
      {n}
    </button>
  );
}
