"use client";

// Right-click a task: Duplicate, or Delete — Sunsama's two. The same colour
// and border as the task cards, flat with no shadow, round corners, solid icons,
// the line between the two edge to edge. Opens beside the card, level with its
// top, and exactly as tall as it — the size of the card, as Sunsama's is.

import { cloneElement, useRef, useState } from "react";
import { Menu } from "@base-ui/react/menu";

// the two rows share the card's height between them
const ITEM =
  "flex min-h-9 flex-1 cursor-pointer select-none items-center gap-3 px-4 text-sm font-medium outline-none transition-colors data-highlighted:bg-foreground/[0.06]";

// two pages, the front one solid
function DuplicateIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0 text-muted-foreground">
      <rect x="1.5" y="3.5" width="9" height="11" rx="2" fill="currentColor" opacity="0.45" />
      <rect x="5" y="1.5" width="9.5" height="11.5" rx="2" fill="currentColor" />
    </svg>
  );
}

// a solid bin, its lid and the lines on it cut out
function DeleteIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0">
      <path fill="currentColor" d="M6 1.5h4a1 1 0 0 1 1 1V3h3a.75.75 0 0 1 0 1.5H2A.75.75 0 0 1 2 3h3v-.5a1 1 0 0 1 1-1Z" />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M3 5.5h10l-.7 8.1a1.5 1.5 0 0 1-1.5 1.4H5.2a1.5 1.5 0 0 1-1.5-1.4L3 5.5Zm3.25 2a.6.6 0 0 0-.6.6v4.3a.6.6 0 0 0 1.2 0V8.1a.6.6 0 0 0-.6-.6Zm3.5 0a.6.6 0 0 0-.6.6v4.3a.6.6 0 0 0 1.2 0V8.1a.6.6 0 0 0-.6-.6Z"
      />
    </svg>
  );
}

export function CardMenu({ onDuplicate, onDelete, children }) {
  const [open, setOpen] = useState(false);
  const anchor = useRef(null);

  return (
    <>
      {/* marks the card while its menu is open, so it stays as if hovered */}
      {cloneElement(children, {
        ref: anchor,
        "data-menu-open": open || undefined,
        className: `${children.props.className ?? ""} group/menu`,
        onContextMenu: (e) => {
          e.preventDefault();
          setOpen(true);
        },
      })}
      <Menu.Root open={open} onOpenChange={setOpen}>
        <Menu.Portal>
          <Menu.Positioner anchor={anchor} side="right" align="start" sideOffset={10} className="z-50 outline-none">
            <Menu.Popup
              onClick={(e) => e.stopPropagation()}
              className="flex h-(--anchor-height) min-h-20 w-52 origin-(--transform-origin) flex-col overflow-hidden rounded-lg border border-foreground/10 bg-card text-card-foreground outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95"
            >
              <Menu.Item onClick={onDuplicate} className={ITEM}>
                <DuplicateIcon />
                Duplicate
              </Menu.Item>
              <Menu.Separator className="h-px shrink-0 bg-foreground/10" />
              <Menu.Item onClick={onDelete} className={`${ITEM} text-[#ef4444] data-highlighted:bg-[#ef4444]/10`}>
                <DeleteIcon />
                Delete
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </>
  );
}
