"use client";

// The phone's sheet (from Manasik): it rises from the bottom with rounded top corners, a grab
// handle, its title and ✕, keeps you where you were, and goes away when pulled down from anywhere.

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDragToClose } from "./drag-to-close";

// action: top right in place of ✕ (a ✓ to save, say)
export function BottomSheet({ open, onOpenChange, title, action, children, className }) {
  const drag = useDragToClose(() => onOpenChange(false));
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          ref={drag}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col rounded-t-[1.75rem] bg-popover pb-[env(safe-area-inset-bottom)] text-popover-foreground shadow-2xl outline-none",
            // rises from below the screen and goes back there, on iOS's curve
            "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
            className,
          )}
        >
          <div className="shrink-0 select-none px-4 pt-2 pb-2">
            <div className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/30" />
            <div className="mt-2 grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2">
              <span />
              <Dialog.Title className="truncate text-center text-base font-semibold">{title}</Dialog.Title>
              <span className="flex justify-end">
                {action ?? (
                  <Dialog.Close aria-label="Close" className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground/70">
                    <X className="size-4" />
                  </Dialog.Close>
                )}
              </span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
