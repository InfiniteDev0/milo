"use client";

// A panel anchored to an edge. Shared by the block sheet, the task sheet and the tray.

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

export const SHEET_WIDTH = "min(27rem, calc(100vw - 2rem))";

const SIDES = {
  right:
    "inset-y-4 right-4 data-open:slide-in-from-right-8 data-closed:slide-out-to-right-8",
  bottom:
    "inset-x-4 bottom-4 data-open:slide-in-from-bottom-8 data-closed:slide-out-to-bottom-8",
  left:
    "inset-y-4 left-4 data-open:slide-in-from-left-8 data-closed:slide-out-to-left-8",
};

export function Sheet({
  open,
  onOpenChange,
  // fired instead of onOpenChange when the close came from clicking away
  onDismiss,
  side = "right",
  // grows to fill the window instead of sitting at panel size
  wide = false,
  // sits to the left of another sheet instead of on top of it
  beside = false,
  style,
  children,
}) {
  const bottom = side === "bottom";

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next, details) => {
        if (!next && details?.reason === "outside-press" && onDismiss) {
          onDismiss();
          return;
        }
        onOpenChange(next, details);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 dark:bg-black/50 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />

        <DialogPrimitive.Popup
          // Only width/height animate — you cannot interpolate `auto` to a length.
          style={
            bottom
              ? {
                  height: wide ? "calc(100svh - 2rem)" : "min(60svh, 30rem)",
                  ...style,
                }
              : { width: wide ? "calc(100vw - 2rem)" : SHEET_WIDTH, ...style }
          }
          // Below lg there is no room for two, so it covers instead of sitting beside.
          className={`fixed z-50 flex flex-col overflow-hidden rounded-2xl bg-card text-sm shadow-[0_24px_60px_rgba(0,0,0,0.14)] outline-none transition-[width,height] duration-300 ease-out data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 ${SIDES[side]} ${
            !bottom && beside ? "lg:right-[calc(27rem+1.5rem)]" : ""
          }`}
        >
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
