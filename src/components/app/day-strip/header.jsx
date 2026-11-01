"use client";

// Drives the day carousel. Sits inside it so it can reach the embla api.

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";

export function Header() {
  const { api, canScrollPrev } = useCarousel();

  return (
    <div className="flex shrink-0 items-center gap-2 px-5 py-4">
      {/* A way BACK, so it means nothing when you are already there. Can't scroll
          left means you are on today — the carousel already knows. */}
      <button
        type="button"
        onClick={() => api?.scrollTo(0)}
        disabled={!canScrollPrev}
        className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
          canScrollPrev
            ? "cursor-pointer bg-[#141414] text-white hover:bg-black"
            : "cursor-default text-black/25"
        }`}
      >
        Today
      </button>

      <CarouselPrevious />
      <CarouselNext />

      <DialogPrimitive.Title className="sr-only">Days ahead</DialogPrimitive.Title>

      <DialogPrimitive.Close
        aria-label="Close"
        className="ml-auto shrink-0 cursor-pointer rounded-lg p-1.5 text-black/40 transition-colors hover:text-black"
      >
        <X className="size-4" />
      </DialogPrimitive.Close>
    </div>
  );
}
