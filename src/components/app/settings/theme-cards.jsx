"use client";

// Pick a theme by looking at it. Three words could not say that the rail stays
// dark in both, or that the page goes warm rather than grey.
//
// The illustrations carry their own rounded corners and shadow, so the ring
// sits off them with a little air instead of doubling up on the edge.

import { Check } from "lucide-react";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeCards({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {OPTIONS.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={on}
            className="flex w-[172px] cursor-pointer flex-col gap-2 text-left"
          >
            <span
              className={`relative block rounded-2xl p-1.5 ring-2 transition-colors ${
                on ? "ring-[#5e17eb]" : "ring-transparent hover:ring-foreground/40"
              }`}
            >
              <img
                src={`/theme-${o.value}.svg`}
                alt=""
                className="block w-full"
                draggable={false}
              />

              {on && (
                <span className="absolute right-3 top-3 flex size-4 items-center justify-center rounded-full bg-[#5e17eb] text-white">
                  <Check className="size-2.5" strokeWidth={4} />
                </span>
              )}
            </span>

            <span className={`pl-2 text-xs ${on ? "text-foreground" : "text-foreground/45"}`}>
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
