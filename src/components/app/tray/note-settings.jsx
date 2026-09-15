"use client";

// What this note is: its colour, the block it belongs to, and whether it's pinned.

import { CalendarClock, Check, Pin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NOTE_COLOURS, paperStyle } from "@/lib/note-colours";
import { nextStamp, stampOf } from "@/lib/stamp";
import { useNow } from "@/lib/time";
import { useBlocks } from "../blocks-provider";
import { NoteSettingsIcon } from "./icons";

export function NoteSettings({ note, onChange }) {
  const { blocks, archived } = useBlocks();

  // a set-aside block still shows if this note already belongs to it
  const setAside = archived.find((b) => b.id === note.blockId);
  const choices = setAside ? [...blocks, setAside] : blocks;

  // a minute's tick keeps "tomorrow" right across midnight
  const now = useNow(true, 60000);
  const tomorrow = now == null ? null : nextStamp(stampOf(new Date(now)));
  const waiting = tomorrow != null && note.showOn === tomorrow;

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
                  style={paperStyle(c)}
                  className="milo-paper flex size-8 cursor-pointer items-center justify-center rounded-lg ring-1 ring-foreground/10 transition-transform hover:scale-110"
                >
                  {(note.colour ?? "plain") === c.id && (
                    <Check className="size-4 text-foreground" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-foreground/5 pt-3">
            <span className="text-xs text-foreground/45">Belongs to</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onChange({ blockId: null })}
                aria-pressed={note.blockId == null}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  note.blockId == null
                    ? "bg-foreground text-background"
                    : "text-foreground/55 ring-1 ring-foreground/10 hover:text-foreground"
                }`}
              >
                Day note
              </button>
              {choices.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onChange({ blockId: b.id })}
                  aria-pressed={note.blockId === b.id}
                  style={{ backgroundColor: b.bg, color: b.ink }}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs transition-shadow ${
                    note.blockId === b.id
                      ? "ring-2 ring-foreground/70 ring-offset-1 ring-offset-popover"
                      : ""
                  }`}
                >
                  {b.name.replace(" Block", "")}
                </button>
              ))}
            </div>
          </div>

          {/* waits for tomorrow's notes; pressing it again keeps it an ordinary note */}
          <button
            type="button"
            onClick={() => tomorrow && onChange({ showOn: waiting ? null : tomorrow })}
            aria-pressed={waiting}
            className={`flex cursor-pointer items-center gap-2 border-t border-foreground/5 pt-3 text-xs transition-colors hover:text-foreground ${
              waiting ? "text-foreground" : "text-foreground/60"
            }`}
          >
            <CalendarClock className="size-3.5" />
            {waiting ? "Coming back tomorrow" : "Bring back tomorrow"}
          </button>

          <button
            type="button"
            onClick={() => onChange({ pinned: !note.pinned })}
            aria-pressed={!!note.pinned}
            className="flex cursor-pointer items-center gap-2 border-t border-foreground/5 pt-3 text-xs text-foreground/60 transition-colors hover:text-foreground"
          >
            <Pin className="size-3.5" fill={note.pinned ? "currentColor" : "none"} />
            {note.pinned ? "Pinned to the top" : "Pin to the top"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
