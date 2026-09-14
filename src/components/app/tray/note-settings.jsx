"use client";

// What this note is, and what becomes of it.

import { Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NOTE_COLOURS } from "@/lib/note-colours";
import { NoteSettingsIcon } from "./icons";

export function NoteSettings({ note, onChange }) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Note settings"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-foreground transition-colors hover:bg-foreground/[0.04]"
          >
            <NoteSettingsIcon className="size-5" />
          </button>
        }
      />

      <PopoverContent align="end" sideOffset={8} className="w-64 p-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-foreground/45">Colour</span>
            <div className="flex flex-wrap gap-2">
              {NOTE_COLOURS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={c.label}
                  onClick={() => onChange({ colour: c.id })}
                  style={{ backgroundColor: c.bg }}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-lg ring-1 ring-foreground/10 transition-transform hover:scale-110"
                >
                  {(note.colour ?? "plain") === c.id && (
                    <Check className="size-4" strokeWidth={3} style={{ color: c.ink }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Keeping is the whole question the day note turns on: it either
              becomes a real note or it goes at midnight. Not wired — the store
              is not decided. */}
          <div className="flex flex-col gap-1 border-t border-foreground/5 pt-3">
            <span className="text-xs text-foreground/45">At midnight</span>
            <p className="text-xs text-foreground/35">
              Not decided yet — this is where keep-or-let-go goes.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
