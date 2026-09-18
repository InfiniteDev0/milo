"use client";

// A month's name and emoji on the Year page, editable in place — any month, including ones from before names were kept.
// The current month's is the same name the Month page edits.

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBlocks } from "../blocks-provider";

const ICONS = ["🌙", "🌱", "🔥", "📖", "🧭", "🛠️", "🌊", "☀️", "🏔️", "✍️", "🎬", "🚀"];

export function MonthName({ stamp, calendar, isCurrent }) {
  const { profile, setProfile } = useBlocks();
  const named = isCurrent ? profile?.month : profile?.year?.months?.[stamp];

  const save = (patch) =>
    setProfile((p) =>
      isCurrent
        ? { ...p, month: { ...(p?.month ?? {}), ...patch } }
        : {
            ...p,
            year: {
              ...(p?.year ?? {}),
              months: {
                ...(p?.year?.months ?? {}),
                [stamp]: { name: "", icon: "", ...(p?.year?.months?.[stamp] ?? {}), ...patch },
              },
            },
          },
    );

  return (
    <header className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label={`Emoji for ${calendar}`}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-xl transition-colors hover:bg-foreground/5"
            >
              {named?.icon || <span className="text-sm text-foreground/30">+</span>}
            </button>
          }
        />
        <PopoverContent align="start" sideOffset={6} className="w-52 p-2">
          <div className="grid grid-cols-6 gap-1">
            {ICONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => save({ icon: named?.icon === e ? "" : e })}
                aria-pressed={named?.icon === e}
                className={`flex size-7 cursor-pointer items-center justify-center rounded-md text-base transition-colors hover:bg-foreground/8 ${
                  named?.icon === e ? "bg-foreground/10" : ""
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* unnamed, it reads as the calendar name; typing gives it yours */}
        <input
          value={named?.name ?? ""}
          onChange={(e) => save({ name: e.target.value })}
          placeholder={calendar}
          aria-label={`Name ${calendar}`}
          className="-mx-1 min-w-0 rounded-md bg-transparent px-1 font-medium outline-none placeholder:text-foreground hover:bg-foreground/4 focus:bg-foreground/4"
        />
        {named?.name && <span className="text-xs text-foreground/45">{calendar}</span>}
      </div>
    </header>
  );
}
