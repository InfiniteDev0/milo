"use client";

// The year's name and emoji, editable where they're shown — your word for the year.

import { useState } from "react";
import { ScopeSwitcher } from "../scope-switcher";
import { useBlocks } from "../blocks-provider";

const ICONS = ["🛠️", "🌱", "🔥", "📖", "🧭", "🚀", "🌊", "☀️", "🏔️", "✍️", "🎯", "🌙"];

export function YearHeader() {
  const { profile, setProfile } = useBlocks();
  const [picking, setPicking] = useState(false);
  const year = profile?.year;

  const setYear = (patch) => setProfile((p) => ({ ...p, year: { ...(p?.year ?? {}), ...patch } }));

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => setPicking((v) => !v)}
            aria-label="Change the year's emoji"
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-2xl transition-colors hover:bg-foreground/5"
          >
            {year?.icon || "🎯"}
          </button>
          <input
            value={year?.name ?? ""}
            onChange={(e) => setYear({ name: e.target.value })}
            placeholder="Name this year"
            aria-label="Name this year"
            className="min-w-0 flex-1 bg-transparent text-2xl outline-none placeholder:text-foreground/25"
          />
        </div>
        <ScopeSwitcher />
      </div>

      {picking && (
        <div className="flex flex-wrap gap-1">
          {ICONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                setYear({ icon: e });
                setPicking(false);
              }}
              aria-label={`Pick ${e}`}
              className={`flex size-9 cursor-pointer items-center justify-center rounded-lg text-lg transition-colors ${
                year?.icon === e ? "bg-foreground/10" : "hover:bg-foreground/5"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
