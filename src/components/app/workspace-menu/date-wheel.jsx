"use client";

/* Pick a day, laid out as beui's wheel picker preview: the date in words, then
   month, day and year wheels in one rounded box, and the tick sound switch under
   it (on unless you turn it off; one setting shared with Add time's scrubber).
   Opens in the middle of the screen; closes on Escape or a click
   anywhere outside it, with no backdrop, so what it changes stays in sight.

   onPick(date) runs as a wheel settles — by default the Tasks view glides to
   that day; the Notes page filters its notes to it. initial: the day it opens
   on (today unless given). years: the years it offers (this year unless given —
   all the Tasks view holds). */

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { WheelPicker } from "@/components/motion/wheel-picker";
import { Switch } from "@/components/motion/switch";
import { usePreference } from "@/hooks/use-preference";
import { TICK_SOUND } from "@/lib/tick-pref";
import { jumpToDay } from "@/lib/jump-to-day";

const MONTHS = Array.from({ length: 12 }, (_, m) => new Date(2000, m, 1).toLocaleDateString([], { month: "long" }));
const daysIn = (month, year) => new Date(year, month + 1, 0).getDate();
// the wheels' shared size, as the preview has it
const WHEEL = { visibleCount: 7, itemHeight: 42 };

const todayParts = () => {
  const now = new Date();
  return { month: now.getMonth(), day: now.getDate(), year: now.getFullYear() };
};

const partsOf = (d) => ({ month: d.getMonth(), day: d.getDate(), year: d.getFullYear() });

export function DateWheel({ open, onOpenChange, onPick = jumpToDay, initial = null, years: yearList = null }) {
  const [picked, setPicked] = useState(todayParts);
  const years = (yearList ?? [new Date().getFullYear()]).map(String);
  const sound = usePreference(TICK_SOUND) === "on";
  // each time it opens, it opens on its starting day, wherever it was left
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setPicked(initial ? partsOf(initial) : todayParts());
  }
  const days = Array.from({ length: daysIn(picked.month, picked.year) }, (_, i) => String(i + 1));

  // a short month pulls the day back to its last (31 January → 28 February)
  const go = (next) => {
    const day = Math.min(next.day, daysIn(next.month, next.year));
    setPicked({ ...next, day });
    onPick(new Date(next.year, next.month, day));
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 rounded-3xl bg-popover px-5 py-4 text-popover-foreground shadow-xl ring-1 ring-foreground/10 outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <Dialog.Title className="text-sm font-normal text-muted-foreground">
            {new Date(picked.year, picked.month, picked.day).toLocaleDateString([], { weekday: "long" })}{" "}
            <span className="font-medium text-foreground tabular-nums">
              {MONTHS[picked.month]} {picked.day}, {picked.year}
            </span>
          </Dialog.Title>
          <div className="flex items-stretch gap-1 rounded-3xl border border-border bg-background p-2">
            <WheelPicker
              options={MONTHS}
              value={MONTHS[picked.month]}
              onValueChange={(m) => go({ ...picked, month: MONTHS.indexOf(m) })}
              className="w-32 border-0 bg-transparent"
              {...WHEEL}
              sound={sound}
              aria-label="Month"
            />
            <WheelPicker
              options={days}
              value={String(picked.day)}
              onValueChange={(d) => go({ ...picked, day: Number(d) })}
              className="w-14 border-0 bg-transparent"
              {...WHEEL}
              sound={sound}
              aria-label="Day"
            />
            <WheelPicker
              options={years}
              value={String(picked.year)}
              onValueChange={(y) => go({ ...picked, year: Number(y) })}
              className="w-20 border-0 bg-transparent"
              {...WHEEL}
              sound={sound}
              aria-label="Year"
            />
          </div>
          <Switch checked={sound} onCheckedChange={(on) => TICK_SOUND.set(on ? "on" : "off")} label="Tick sound" className="origin-left scale-[0.85] [&_label]:text-sm" />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
