"use client";

// "Make task recurring", from the repeat icon on a card — Sunsama's list, read
// against the day the task was written on. Blue once it repeats.
//
// Custom… sets a rule of your own: every N days, weeks (on the weekdays you
// pick), months or years. Add time gives the task a time of day, shown on the
// card and carried on every repeat. Both need migration 0020; until then they
// say so instead of saving something the database can't hold.

import { useState } from "react";
import { Check, Clock, Repeat } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { checkExtras, dayTaskExtras } from "@/lib/db/day-tasks";
import { customLabel, repeatOptions } from "@/lib/repeat";
import { cn } from "@/lib/utils";
import { Tip } from "./tip";
import { TimeScrubber } from "@/components/motion/time-scrubber";
import { Switch } from "@/components/motion/switch";
import { usePreference } from "@/hooks/use-preference";
import { TICK_SOUND } from "@/lib/tick-pref";

const ITEM = "h-9 cursor-pointer gap-2 rounded-sm px-2.5 text-[15px] focus:bg-muted";
const WAITING = "Custom repeats and times switch on once migration 0020 is run in Supabase.";
const UNITS = [
  { id: "day", label: "days" },
  { id: "week", label: "weeks" },
  { id: "month", label: "months" },
  { id: "year", label: "years" },
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const BUTTON = "h-9 cursor-pointer rounded-sm px-4 text-sm font-medium transition-colors";

// "09:30" as the person reads times: "9:30 AM" or "09:30"
export const timeLabel = (t) => {
  const [h, m] = t.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

// the custom rule, being set: every N units, and for weeks which days
function CustomRepeat({ origin, rule, onSave, onClose }) {
  const [every, setEvery] = useState(rule?.every ?? 1);
  const [unit, setUnit] = useState(rule?.unit ?? "week");
  const [days, setDays] = useState(rule?.days ?? [origin.getDay()]);
  const next = { every: Math.max(1, Math.min(99, Number(every) || 1)), unit, ...(unit === "week" && { days: [...days].sort() }) };

  return (
    <div className="flex flex-col gap-4">
      <DialogTitle className="text-base font-semibold">Repeat every</DialogTitle>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={99}
          value={every}
          onChange={(e) => setEvery(e.target.value)}
          aria-label="How many"
          className="h-9 w-16 rounded-sm border border-border bg-transparent px-2.5 text-sm tabular-nums outline-none focus:ring-1 focus:ring-[#2f80ed]"
        />
        <div className="flex flex-1 gap-1 rounded-sm bg-muted p-1">
          {UNITS.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setUnit(u.id)}
              className={cn("h-7 flex-1 cursor-pointer rounded-sm text-sm transition-colors", unit === u.id ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>
      {unit === "week" && (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">On</span>
          <div className="flex gap-1.5">
            {WEEKDAYS.map((d, i) => {
              const on = days.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={on}
                  // at least one day stays picked
                  onClick={() => setDays((now) => (on ? (now.length > 1 ? now.filter((x) => x !== i) : now) : [...now, i]))}
                  className={cn("size-9 cursor-pointer rounded-full text-sm font-medium transition-colors", on ? "bg-[#2f80ed] text-white" : "bg-muted text-muted-foreground hover:text-foreground")}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <p className="text-sm text-muted-foreground">{customLabel(next)}</p>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={cn(BUTTON, "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          Cancel
        </button>
        <button type="button" onClick={() => onSave(next)} className={cn(BUTTON, "bg-foreground text-background hover:opacity-90")}>
          Save
        </button>
      </div>
    </div>
  );
}

const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const fromMinutes = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

// the time of day, being set: Bencho's time scrubber, a ruler you drag or fling, in 5-minute steps
function AddTime({ time, onSave, onClose }) {
  const [value, setValue] = useState(time ?? "09:00");
  // the same tick sound setting as the date wheel
  const sound = usePreference(TICK_SOUND) === "on";
  return (
    <div className="flex flex-col gap-4">
      <DialogTitle className="text-base font-semibold">Add time</DialogTitle>
      <div className="flex justify-center">
        <TimeScrubber start={toMinutes(value)} step="5" momentum={50} format="12h" corner={16} onChange={(m) => setValue(fromMinutes(m))} sound={sound} />
      </div>
      <div className="flex justify-center">
        <Switch checked={sound} onCheckedChange={(on) => TICK_SOUND.set(on ? "on" : "off")} label="Tick sound" className="origin-left scale-[0.85] [&_label]:text-sm" />
      </div>
      <div className="flex items-center justify-between gap-2">
        {time ? (
          <button type="button" onClick={() => onSave(null)} className={cn(BUTTON, "text-[#ef4444] hover:bg-[#ef4444]/10")}>
            Remove time
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className={cn(BUTTON, "text-muted-foreground hover:bg-muted hover:text-foreground")}>
            Cancel
          </button>
          <button type="button" onClick={() => value && onSave(value)} className={cn(BUTTON, "bg-foreground text-background hover:opacity-90")}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// value: the repeat; rule: a custom repeat's rule; time: its time of day. onChange(patch) for the task
export function RepeatMenu({ origin, value = "none", rule, time, onChange, className }) {
  const on = value !== "none";
  // which little window is open: "custom", "time", or none
  const [panel, setPanel] = useState(null);
  const open = (which) => (dayTaskExtras() ? setPanel(which) : checkExtras().then((on) => (on ? setPanel(which) : toast(WAITING))));
  // how far to push the menu: from the icon to just past the card's right edge, and up to the card's top
  const [offset, setOffset] = useState({ side: 8, align: 0 });
  const place = (trigger) => {
    const card = trigger.closest("[data-task-card]")?.getBoundingClientRect();
    if (!card) return;
    const icon = trigger.getBoundingClientRect();
    setOffset({ side: Math.max(8, card.right - icon.right + 8), align: card.top - icon.top });
  };

  return (
    <>
      <DropdownMenu>
        <Tip label={on ? (value === "custom" ? customLabel(rule) : "Repeats") : "Make it repeat"}>
          <DropdownMenuTrigger
            aria-label="Make task recurring"
            // measured as it's pressed: how far the card reaches past the icon, so the menu opens beside the card
            onPointerDown={(e) => place(e.currentTarget)}
            onKeyDown={(e) => place(e.currentTarget)}
            onClick={(e) => e.stopPropagation()}
            className={cn("cursor-pointer transition-colors hover:text-[#2f80ed]", on && "text-[#2f80ed]", className)}
          >
            <Repeat className="size-3.5" />
          </DropdownMenuTrigger>
        </Tip>
        {/* beside the card (past its right edge, level with its top), not over it or the cards under it */}
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={offset.side}
          alignOffset={offset.align}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-80 rounded-sm border border-border bg-popover p-1.5 shadow-xl ring-0 dark:bg-[#161616]"
        >
          {/* a label has to sit in a group, or the menu throws when it opens */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2.5 pb-2 pt-1.5 text-sm font-normal text-muted-foreground">
              Make task recurring
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="mx-2.5 my-1" />
          {repeatOptions(origin).map((o) => (
            <DropdownMenuItem key={o.id} className={ITEM} onClick={() => onChange({ repeat: o.id })}>
              <span className="flex-1">
                {o.label}
                {o.hint && <span className="text-muted-foreground"> ({o.hint})</span>}
              </span>
              {value === o.id && <Check className="size-4" />}
            </DropdownMenuItem>
          ))}
          {/* a custom rule in use shows as its own line, ticked */}
          {value === "custom" && (
            <DropdownMenuItem className={ITEM} onClick={() => open("custom")}>
              <span className="flex-1">{customLabel(rule)}</span>
              <Check className="size-4" />
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className={ITEM} onClick={() => open("custom")}>
            <span className="flex-1">Custom…</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="mx-2.5 my-1" />
          <DropdownMenuItem className={ITEM} onClick={() => open("time")}>
            <Clock className="size-4" />
            <span className="flex-1">{time ? `At ${timeLabel(time)}` : "Add time"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={panel != null} onOpenChange={(next) => !next && setPanel(null)}>
        {/* drawn over the page but living inside the card: a press here must never reach the card,
            or dragging the time scrubber drags the task behind it */}
        <DialogContent
          showCloseButton={false}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="rounded-sm sm:max-w-sm"
        >
          {panel === "custom" && (
            <CustomRepeat
              origin={origin}
              rule={rule}
              onClose={() => setPanel(null)}
              onSave={(next) => {
                onChange({ repeat: "custom", repeatRule: next });
                setPanel(null);
              }}
            />
          )}
          {panel === "time" && (
            <AddTime
              time={time}
              onClose={() => setPanel(null)}
              onSave={(next) => {
                onChange({ atTime: next });
                setPanel(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
