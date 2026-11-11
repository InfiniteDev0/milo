"use client";

// Milo's face, bottom right, on every page. Opens the Milo panel; gone while
// it's open — the panel carries its own close.

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShellFace } from "../shell-face";

// module scope: an inline subscribe resubscribes every render and loops
const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function MiloButton({ open, onOpen }) {
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
              onClick={onOpen}
              aria-label="Ask Milo"
              // phones: Milo sits in the header instead, clear of the tab bar
              className="fixed bottom-12 right-6 z-40 flex size-12 max-md:hidden cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-chip shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-transform hover:scale-105"
            >
              <ShellFace className="size-12 touch-none select-none" />
            </button>
          }
        />
        <TooltipContent side="top">Ask Milo</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
    document.body,
  );
}
