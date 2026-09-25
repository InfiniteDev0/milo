"use client";

// A panel anchored to an edge. Shared by the block sheet, the task sheet and the tray.

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

export const SHEET_WIDTH = "min(27rem, calc(100vw - 2rem))";

// Covers the app pane, stopping at the nav rail: the rail takes 5.5rem (p-4 + w-12 + gap-6 in (app)/layout.js)
// and the sheet keeps its 1rem on the right. Never narrower than the panel, so phones keep the normal sheet.
export const PANE_WIDTH = `max(${SHEET_WIDTH}, calc(100vw - 6.5rem))`;

// quick to start, soft to settle, so growing to full screen and back reads as one movement
export const GROW_TRANSITION = "width 560ms cubic-bezier(0.32, 0.72, 0, 1)";

const SIDES = {
  right:
    "inset-y-4 right-4 data-open:slide-in-from-right-8 data-closed:slide-out-to-right-8",
  bottom:
    "inset-x-4 bottom-4 data-open:slide-in-from-bottom-8 data-closed:slide-out-to-bottom-8",
  left:
    "inset-y-4 left-4 data-open:slide-in-from-left-8 data-closed:slide-out-to-left-8",
  center:
    "inset-y-4 left-1/2 -translate-x-1/2 data-open:zoom-in-95 data-closed:zoom-out-95",
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
  // stays open while you use the page behind it: no backdrop, and clicking elsewhere doesn't close it
  floating = false,
  // floating, but a click outside still closes it
  dismissible = false,
  style,
  children,
}) {
  const bottom = side === "bottom";

  return (
    <DialogPrimitive.Root
      open={open}
      modal={!floating}
      disablePointerDismissal={floating && !dismissible}
      onOpenChange={(next, details) => {
        if (!next && details?.reason === "outside-press" && onDismiss) {
          onDismiss();
          return;
        }
        onOpenChange(next, details);
      }}
    >
      <DialogPrimitive.Portal>
        {!floating && (
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 dark:bg-black/50 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        )}

        <DialogPrimitive.Popup
          // lets a grip inside find the sheet it moves
          data-sheet=""
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
