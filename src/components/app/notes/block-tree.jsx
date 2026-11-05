"use client";

/* The By block list in the Notes side panel, drawn like the categories tree:
   the block's colour as a square where a category has its icon, turning into
   the chevron on hover, and its notes count at the end. Click the name to see
   that block's notes on the right; the chevron opens its notes in the tree,
   with the accordion's ease. Day notes closes the list. */

import { useState } from "react";
import { ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// the accordion's ease, as the categories tree uses
const EASE = "duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]";

// rows: [{ id, name, colour, notes }]. place: the one shown on the right
export function BlockTree({ rows, place, onPlace, onOpenNote }) {
  const [open, setOpen] = useState(() => new Set());
  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <nav aria-label="Blocks" className="flex flex-col gap-0.5">
      {rows.map((b) => {
        const isOpen = open.has(b.id);
        return (
          <div key={b.id}>
            <div
              className={cn(
                "group/cat flex h-9 items-center gap-1.5 rounded-sm px-1.5 text-sm font-medium transition-colors hover:bg-foreground/6",
                place === b.id && "bg-foreground/6",
              )}
            >
              <button
                type="button"
                onClick={() => toggle(b.id)}
                aria-expanded={isOpen}
                aria-label={isOpen ? `Close ${b.name}` : `Open ${b.name}`}
                className="relative flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors hover:bg-foreground/10"
              >
                <span className="size-4 rounded-sm group-hover/cat:invisible" style={{ background: b.colour }} />
                <ChevronRight
                  className={cn(
                    "absolute size-4 text-muted-foreground opacity-0 transition-[rotate,opacity] group-hover/cat:opacity-100",
                    EASE,
                    isOpen && "rotate-90",
                  )}
                />
              </button>
              <button type="button" onClick={() => onPlace(b.id)} className="min-w-0 flex-1 cursor-pointer truncate text-left">
                {b.name}
              </button>
              <span className="shrink-0 pe-1 text-xs tabular-nums text-muted-foreground">{b.notes.length}</span>
            </div>

            {/* its notes, on a guide line under the square */}
            <div
              className={cn("grid transition-[grid-template-rows,opacity]", EASE, isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
              inert={!isOpen}
            >
              <div className="min-h-0 overflow-hidden">
                <ul
                  className={cn(
                    "mb-1 ms-[1.1rem] border-s border-foreground/15 transition-[translate,filter]",
                    EASE,
                    isOpen ? "translate-y-0 blur-none" : "-translate-y-1.5 blur-[2px]",
                  )}
                >
                  {b.notes.length === 0 && <li className="py-1.5 ps-4 text-sm text-muted-foreground/70">No notes inside</li>}
                  {b.notes.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => onOpenNote?.(n, null)}
                        className="relative flex h-8 w-full cursor-pointer items-center gap-2 rounded-sm ps-4 pe-1.5 text-left text-sm text-muted-foreground transition-colors before:absolute before:start-0 before:top-1/2 before:w-2.5 before:border-t before:border-foreground/15 hover:bg-foreground/6 hover:text-foreground"
                      >
                        <FileText className="size-3.5 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">{n.title?.trim() || "Untitled"}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
