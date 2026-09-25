"use client";

// The book's ⋯ menu: its name, and its cover. Pick a cover and the book wears it straight away.

import { useState } from "react";
import Image from "next/image";
import { Check, MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COVERS } from "./covers";

export function CoverMenu({ cover, onCover, title, onTitle }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Book options"
            // hidden until hover; always shown where there's no hover, and to the keyboard
            className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full text-foreground/70 opacity-0 transition-all duration-500 ease-out hover:bg-foreground/10 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 data-[popup-open]:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </button>
        }
      />
      <PopoverContent align="end" sideOffset={6} className="w-64 gap-2 p-3">
        <label className="flex flex-col gap-1.5">
          <span className="px-0.5 text-xs text-foreground/50">Name</span>
          <input
            defaultValue={title}
            maxLength={60}
            onBlur={(e) => {
              const t = e.target.value.trim();
              if (t && t !== title) onTitle(t);
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="h-8 rounded-lg bg-foreground/5 px-2.5 text-sm outline-none"
          />
        </label>
        <span className="px-0.5 text-xs text-foreground/50">Cover</span>
        <div className="grid grid-cols-3 gap-2">
          {COVERS.map((c) => {
            const worn = c.id === cover;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onCover(c.id);
                  setOpen(false);
                }}
                aria-pressed={worn}
                className="flex cursor-pointer flex-col items-center gap-1.5"
              >
                <span
                  className={`relative block aspect-[1414/2000] w-full overflow-hidden rounded-[2px_5px_5px_2px] transition-all ${
                    worn ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : "ring-1 ring-foreground/10 hover:ring-foreground/30"
                  }`}
                >
                  <Image src={c.image} alt="" fill sizes="5rem" className="object-cover" draggable={false} />
                  {worn && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                      <Check className="size-4 text-white" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-foreground/60">{c.name}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
