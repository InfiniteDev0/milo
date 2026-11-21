"use client";

// Milo's face floating bottom right, as in the app. A click takes you to sign up.

import Link from "next/link";
import MiloFace from "@/components/MiloFace";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function MiloFloat() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href="/auth"
              aria-label="Get started with Milo"
              className="fixed right-6 bottom-12 z-40 flex size-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-transform hover:scale-105"
            >
              <MiloFace className="size-12 touch-none select-none" />
            </Link>
          }
        />
        <TooltipContent side="top">Get started</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
