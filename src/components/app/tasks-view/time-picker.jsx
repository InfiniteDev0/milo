"use client";

// Pick a duration: type one ("45m, 1h 30m, 130…") and press Enter, or choose
// from the list — Sunsama's picker. Used for both Actual and Estimated.

import { useState } from "react";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PRESETS, parseDuration, presetLabel } from "@/lib/duration";

export function TimePicker({ trigger, onPick }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const pick = (minutes) => {
    onPick(minutes);
    setText("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent
        align="end"
        sideOffset={6}
        onClick={(e) => e.stopPropagation()}
        className="w-64 gap-0 rounded-sm border border-border bg-popover p-0 shadow-xl ring-0 dark:bg-[#161616]"
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <Clock className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              const m = parseDuration(text);
              if (e.key === "Enter" && m != null) pick(m);
            }}
            placeholder="45m, 1h 30m, 130…"
            aria-label="Duration"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="scrollbar-pill max-h-60 overflow-y-auto p-1">
          {PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => pick(m)}
              className="flex h-9 w-full cursor-pointer items-center rounded-sm px-2.5 text-left text-sm hover:bg-muted"
            >
              {presetLabel(m)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
