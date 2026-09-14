"use client";

// Bottom right, out of the day's way. Gone while the sheet is open — the sheet
// carries its own close.

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { maskStyle } from "@/lib/mask";

// Module scope, and that is the whole point: an inline subscribe is a new
// function every render, so React resubscribes and re-reads the snapshot each
// time — which renders again. That is the "maximum update depth" loop.
const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function TrayHandle({ open, onToggle }) {
  // false on the server, true on the client, without an effect or a mismatch
  const ready = useSyncExternalStore(subscribe, onClient, onServer);
  if (!ready || open) return null;

  return createPortal(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={onToggle}
              aria-label="Today's note"
              className="group/handle fixed bottom-6 right-6 z-40 flex size-14 cursor-pointer items-center justify-center rounded-3xl bg-chrome shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-colors hover:bg-chrome-hover"
            >
              {/* Same rule as the nav rail: grey at rest, the notes gradient on
                  hover. No active state — the button is gone while the sheet is open. */}
              <span
                aria-hidden
                style={maskStyle("/pencil.svg")}
                className="size-6 bg-chrome-ink/40 transition-all duration-200 group-hover/handle:bg-[linear-gradient(135deg,#ffd600,#ff007a)]"
              />
            </button>
          }
        />
        {/* left, not top — it sits in the corner and would run off the edge */}
        <TooltipContent side="top">Today&rsquo;s note</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
    document.body,
  );
}
