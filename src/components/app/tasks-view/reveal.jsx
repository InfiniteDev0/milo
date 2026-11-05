"use client";

/* The row a card reveals on hover, opening the way the accordion does: the
   height eases open from nothing, the row fades in, and it settles down into
   place with a brief focus pull. One for both kinds of card, day and block.

   Open while the card is hovered or focused, while its right-click menu or one
   of its own menus is open, or always (`show`, when a part of the card is open).
   Height animates through grid rows, 0fr to 1fr, so it follows the content
   without measuring it. */

import { NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = "duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]";

export function Reveal({ show = false, children }) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity]",
        EASE,
        show
          ? "grid-rows-[1fr] opacity-100"
          : "grid-rows-[0fr] opacity-0 group-hover/card:grid-rows-[1fr] group-hover/card:opacity-100 group-focus-within/card:grid-rows-[1fr] group-focus-within/card:opacity-100 group-data-[menu-open]/menu:grid-rows-[1fr] group-data-[menu-open]/menu:opacity-100 group-has-[[data-popup-open]]/card:grid-rows-[1fr] group-has-[[data-popup-open]]/card:opacity-100",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "pt-2 transition-[translate,filter]",
            EASE,
            show
              ? "translate-y-0 blur-none"
              : "-translate-y-1.5 blur-[2px] group-hover/card:translate-y-0 group-hover/card:blur-none group-focus-within/card:translate-y-0 group-focus-within/card:blur-none group-data-[menu-open]/menu:translate-y-0 group-data-[menu-open]/menu:blur-none group-has-[[data-popup-open]]/card:translate-y-0 group-has-[[data-popup-open]]/card:blur-none",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// a quiet mark on the card's first line that it has a note, so you know without hovering
export function NoteMark({ count }) {
  if (!count) return null;
  return (
    <span
      title={count === 1 ? "Has a note" : `${count} notes`}
      className="pointer-events-none mt-0.5 flex shrink-0 items-center gap-0.5 text-[11px] tabular-nums text-muted-foreground"
    >
      <NotebookPen className="size-3" />
      {count > 1 && count}
    </span>
  );
}

