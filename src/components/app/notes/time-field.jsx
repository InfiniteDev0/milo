"use client";

// A task's time of day, in the new-task dialog: "No time" until one is set; click for the time
// scrubber (the same ruler as Add time on a card), then Done or Clear. Stored as "HH:MM".

import { useState } from "react";
import { Clock, X } from "lucide-react";
import { TimeScrubber } from "@/components/motion/time-scrubber";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePreference } from "@/hooks/use-preference";
import { TICK_SOUND } from "@/lib/tick-pref";
import { cn } from "@/lib/utils";
import { timeLabel } from "../tasks-view/repeat-menu";
import { CHIP, CHIP_ON } from "./new-task-styles";

const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const fromMinutes = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export function TimeField({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? "09:00");
  const sound = usePreference(TICK_SOUND) === "on";

  return (
    <div className="flex items-center gap-1.5">
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(value ?? "09:00");
          setOpen(next);
        }}
      >
        <PopoverTrigger className={cn(CHIP, value && CHIP_ON)}>
          <Clock className="size-3.5" />
          {value ? timeLabel(value) : "No time"}
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className="w-auto gap-3 p-3">
          <TimeScrubber start={toMinutes(draft)} step="5" momentum={50} format="12h" corner={16} onChange={(m) => setDraft(fromMinutes(m))} sound={sound} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className={CHIP}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(draft);
                setOpen(false);
              }}
              className={cn(CHIP, CHIP_ON)}
            >
              Set {timeLabel(draft)}
            </button>
          </div>
        </PopoverContent>
      </Popover>
      {value && (
        <button type="button" onClick={() => onChange(null)} aria-label="Clear the time" className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
