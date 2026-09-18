"use client";

// A theme for each weekday — "Tuesday is Media day". It shows beside the date that day and in the Day ahead.
// A theme describes the day; it never adds work to it.

import { X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DAYS } from "@/lib/days";
import { useBlocks } from "../blocks-provider";

const EMOJI = ["🎬", "📚", "✍️", "🎨", "💼", "🏋️", "🧘", "🌱", "🧹", "🎧", "🧪", "🛠️", "🍳", "🧭", "☀️", "🌊"];

function DayRow({ day, theme, onChange, onClear }) {
  return (
    <div className="flex items-center gap-3 border-t border-foreground/8 py-3 first:border-t-0">
      <span className="w-24 shrink-0 text-sm">{day.name}</span>

      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label={`Emoji for ${day.name}`}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg ring-1 ring-foreground/10 transition-colors hover:bg-foreground/5"
            >
              {theme?.emoji || <span className="text-sm text-foreground/30">+</span>}
            </button>
          }
        />
        <PopoverContent align="start" sideOffset={6} className="w-60 p-2">
          <div className="grid grid-cols-8 gap-1">
            {EMOJI.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => onChange({ emoji: theme?.emoji === e ? "" : e })}
                aria-pressed={theme?.emoji === e}
                className={`flex size-7 cursor-pointer items-center justify-center rounded-md text-base transition-colors hover:bg-foreground/8 ${
                  theme?.emoji === e ? "bg-foreground/10" : ""
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <input
        value={theme?.name ?? ""}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="No theme"
        aria-label={`Theme for ${day.name}`}
        maxLength={40}
        className="h-9 min-w-0 flex-1 rounded-lg border border-foreground/10 bg-card px-3 text-sm outline-none placeholder:text-foreground/30 focus:border-foreground/30"
      />

      {theme && (
        <button
          type="button"
          onClick={onClear}
          aria-label={`Clear ${day.name}'s theme`}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export function Week() {
  const { dayThemes, setDayTheme, clearDayTheme, hydrated } = useBlocks();

  return (
    <section className="flex max-w-2xl flex-col">
      <div className="flex flex-col gap-0.5 pb-4">
        <span className="text-md">Day themes</span>
        <span className="text-sm text-foreground/50">
          Give a weekday its main thread, like Media day on Tuesdays. It shows beside the date and in the Day ahead.
        </span>
      </div>

      {hydrated &&
        DAYS.map((d) => (
          <DayRow
            key={d.id}
            day={d}
            theme={dayThemes[d.id]}
            onChange={(patch) => setDayTheme(d.id, patch)}
            onClear={() => clearDayTheme(d.id)}
          />
        ))}
    </section>
  );
}
