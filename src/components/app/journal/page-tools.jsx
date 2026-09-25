"use client";

// A page's own tools in its top outer corner, faint until you reach for them: bookmark, pin, record, remove.
// Removing asks twice; a journal is somewhere nothing goes by accident.

import { useEffect, useState } from "react";
import { Bookmark, Mic, Paperclip, Square, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { INK } from "./paper";
import { PinMenu } from "./pin-menu";
import { mmss, useRecorder } from "./use-recorder";

const TOOL =
  "flex size-[4.4cqh] cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#27324d]/10";

export function PageTools({ page, side, onPatch, onRemove, onVoice }) {
  const [asking, setAsking] = useState(false);
  const { recording, seconds, start, stop } = useRecorder((audio, secs) => onVoice(page.id, audio, secs));

  // the second tap has to come soon, or it asks again
  useEffect(() => {
    if (!asking) return;
    const t = setTimeout(() => setAsking(false), 3000);
    return () => clearTimeout(t);
  }, [asking]);

  return (
    <div
      className={`absolute top-[2.4cqh] z-10 flex items-center gap-[0.4cqw] transition-opacity duration-300 focus-within:opacity-100 group-hover/page:opacity-100 [@media(hover:none)]:opacity-100 ${
        recording || asking ? "opacity-100" : "opacity-0"
      }`}
      style={{ [side === 0 ? "left" : "right"]: "13cqw", color: INK }}
    >
      <button
        type="button"
        onClick={() => onPatch({ bookmarked: !page.bookmarked }, 0)}
        aria-label={page.bookmarked ? "Remove bookmark" : "Bookmark this page"}
        aria-pressed={page.bookmarked}
        className={TOOL}
      >
        <Bookmark className="size-[2.2cqh]" fill={page.bookmarked ? "currentColor" : "none"} />
      </button>

      <Popover>
        <PopoverTrigger
          render={
            <button type="button" aria-label="Pin notes or blocks" className={TOOL}>
              <Paperclip className="size-[2.2cqh]" />
            </button>
          }
        />
        <PopoverContent align={side === 0 ? "start" : "end"} sideOffset={6} className="w-64">
          <PinMenu page={page} onPatch={onPatch} />
        </PopoverContent>
      </Popover>

      <button
        type="button"
        onClick={recording ? stop : start}
        aria-label={recording ? "Stop recording" : "Record a voice note"}
        className={`${TOOL} ${recording ? "w-auto gap-[0.6cqw] bg-[#b8434a] px-[1.2cqw] text-white hover:bg-[#b8434a]" : ""}`}
      >
        {recording ? (
          <>
            <Square className="size-[1.8cqh]" fill="currentColor" />
            <span className="font-sans text-[1.6cqh] tabular-nums">{mmss(seconds)}</span>
          </>
        ) : (
          <Mic className="size-[2.2cqh]" />
        )}
      </button>

      <button
        type="button"
        onClick={() => (asking ? onRemove(page.id) : setAsking(true))}
        aria-label={asking ? "Tap again to remove this page" : "Remove this page"}
        className={`${TOOL} ${asking ? "w-auto bg-[#b8434a] px-[1.2cqw] text-white hover:bg-[#b8434a]" : ""}`}
      >
        {asking ? <span className="font-sans text-[1.6cqh]">Remove?</span> : <Trash2 className="size-[2.2cqh]" />}
      </button>
    </div>
  );
}

// a ribbon hanging from the top of a bookmarked page
export function Ribbon({ side }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-0 z-10 h-[11cqh] w-[3.4cqw]"
      style={{
        [side === 0 ? "left" : "right"]: "9cqw",
        background: "#b8434a",
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}
    />
  );
}
