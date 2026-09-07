"use client";

/* The day you're looking at. Sits under the greeting and is the only anchor in
   the shell — Milo shows one day at a time, so this is how you move between
   them. A button, not a text field: the date is a selection, not something you
   type. */

import { useState } from "react";
import { format } from "date-fns";
import { shade } from "@/lib/shade";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({ className }) {
  const [date, setDate] = useState(new Date());

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            id="milo-date"
            aria-label="Pick a date"
            className={`milo-lift h-9 w-56 justify-between gap-3 rounded-xl bg-[#262626] px-4 border-0 font-normal text-white hover:bg-[#303030] ${className ?? ""}`}
            /* Two shades on purpose: a face light enough to read as a
               surface, and a side dark enough to look like a side. Same rule
               as the blocks — the face's own colour, darkened — just taken
               further, because near-black has almost nowhere left to darken
               into.

               Hover moves the face only. The side stays put, so the button
               keeps its shape instead of flattening under the cursor. */
            style={{ "--lift": shade("#262626", 0.72) }}
          >
            {format(date, "PPP")}
            <CalendarIcon className="size-4 shrink-0 text-white/45" />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="center" sideOffset={10}>
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(next) => next && setDate(next)}
        />
      </PopoverContent>
    </Popover>
  );
}
