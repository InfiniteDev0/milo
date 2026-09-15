"use client";

/* The day you're looking at. Sits under the greeting and is the only anchor in
   the shell — Milo shows one day at a time, so this is how you move between
   them. A button, not a text field: the date is a selection, not something you
   type. */

import { useRef, useState } from "react";
import { format } from "date-fns";
import { shade } from "@/lib/shade";
/* Shared, not copied. The block sheet paints Stop the same yellow, and two
   hardcoded copies of a colour that MEANS something drift apart. */
import { PAUSE as DAY_PAUSE, PAUSE_INK as DAY_PAUSE_INK, END as DAY_END, END_LIFT as DAY_END_LIFT } from "@/lib/palette";
import { CalendarIcon, Moon, Pause, Play, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlocks } from "./blocks-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({ className }) {
  const { day, paused, pauseDay, resumeDay } = useBlocks();
  const [open, setOpen] = useState(false);

  // what to open once this menu has finished closing: a dialog opened mid-close lost the race and never showed
  const next = useRef(null);
  const openAfter = (event) => {
    next.current = event;
    setOpen(false);
  };

  // Milo runs one day. The button names it; the popover is what you can do to it.
  const date = new Date();

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        if (isOpen || !next.current) return;
        window.dispatchEvent(next.current);
        next.current = null;
      }}
    >
      <PopoverTrigger
        render={
          <Button
            id="milo-date"
            aria-label="Pick a date"
            className={`milo-lift h-9 w-56 justify-between gap-3 rounded-xl bg-solid px-4 border-0 font-normal text-solid-ink hover:bg-solid-hover ${className ?? ""}`}
            /* Two shades on purpose: a face light enough to read as a
               surface, and a side dark enough to look like a side. Same rule
               as the blocks — the face's own colour, darkened — just taken
               further, because near-black has almost nowhere left to darken
               into.

               Hover moves the face only. The side stays put, so the button
               keeps its shape instead of flattening under the cursor. */
            style={{ "--lift": "var(--solid-lift)" }}
          >
            {format(date, "PPP")}
            <CalendarIcon className="size-4 shrink-0 text-solid-ink/45" />
          </Button>
        }
      />
      <PopoverContent className="w-72 p-0" align="center" sideOffset={10}>
        {/* The day's two controls, under the day it belongs to.

            They are different things and the copy has to say so, because
            getting them the wrong way round costs you either your place or
            your day:

              PAUSE stops the clock and remembers where you were — the block
              and the task. Nothing accrues while you are away and nothing is
              lost. It is for making your bed.

              END files the day and resets tomorrow's. It is the closing
              screen, and it is not undoable.

            Pausing a TASK is a third thing and is not here: you do that by
            starting a different one, and the clock simply moves from the
            task to the block. You never left. */}
        <div className="flex flex-col gap-3 p-3">
          {/* Looking before doing: today or tomorrow, one block at a time. The sheet lives in the shell, so an event opens it. */}
          <button
            type="button"
            onClick={() => openAfter(new CustomEvent("milo:day-ahead", { detail: "today" }))}
            style={{ "--lift": "var(--card-lift)" }}
            className="milo-lift flex cursor-pointer items-center gap-2.5 rounded-xl border border-foreground/10 bg-card px-3 py-2.5 text-left text-sm"
          >
            <Sunrise className="size-4 shrink-0 opacity-60" />
            <span className="flex flex-col">
              Day ahead
              <span className="text-xs text-foreground/50">
                Today or tomorrow, one block at a time
              </span>
            </span>
          </button>

          {/* Yellow is the day still going — the Morning block's colour, the
              first one in the palette, the one this app already means 'awake'
              by. Blue is night. You should be able to tell these two apart
              with the words blurred out. */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              paused ? resumeDay() : pauseDay();
            }}
            disabled={!day.startedAt || (day.endedAt != null && !paused)}
            style={{ backgroundColor: DAY_PAUSE, color: DAY_PAUSE_INK, "--lift": shade(DAY_PAUSE) }}
            className="milo-lift flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm disabled:cursor-default disabled:opacity-40 disabled:shadow-none disabled:active:translate-y-0"
          >
            {paused ? (
              <Play className="size-4 shrink-0 opacity-60" />
            ) : (
              <Pause className="size-4 shrink-0 opacity-60" />
            )}
            <span className="flex flex-col">
              {paused ? "Pick the day back up" : "Pause the day"}
              <span className="text-xs opacity-55">
                {paused
                  ? "Back to exactly where you were"
                  : "Stops the clock. Nothing is lost."}
              </span>
            </span>
          </button>

          <button
            type="button"
            /* The closing screen lives in the day bar, which is a sibling
               of this button, not a parent — so they cannot pass a prop.
               One event, no shared state, and the page it sits on stays a
               server component. */
            onClick={() => openAfter(new Event("milo:close-day"))}
            style={{ backgroundColor: DAY_END, color: "#ffffff", "--lift": DAY_END_LIFT }}
            className="milo-lift flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm"
          >
            <Moon className="size-4 shrink-0 opacity-70" />
            <span className="flex flex-col">
              End the day
              <span className="text-xs opacity-55">
                What happened, and tonight&rsquo;s entry
              </span>
            </span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
