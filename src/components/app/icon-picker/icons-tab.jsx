"use client";

/* Every lucide icon, in the colour picked: a filter, Random, the colour (kept
   for next time), then the grid, each naming itself on hover. Only the rows in
   view are drawn (windowed.jsx). The set is fetched as the picker opens. */

import { useDeferredValue, useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { usePreference } from "@/hooks/use-preference";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tip } from "../tasks-view/tip";
import { useHoverLabel } from "./hover-label";
import { FilterBox, SQUARE } from "./filter-box";
import { ICON_COLOUR, ICON_COLOURS, iconWords, useLucideIcons } from "./shared";
import { Windowed, rowsOf } from "./windowed";

// as tall as the emoji grid and its section bar together, so switching tabs doesn't jump
const HEIGHT = 333;

export function IconsTab({ onPick }) {
  const icons = useLucideIcons();
  const [query, setQuery] = useState("");
  // typing stays quick; the matches catch up a beat behind
  const search = useDeferredValue(query);
  const colourId = usePreference(ICON_COLOUR);
  const colour = ICON_COLOURS.find((c) => c.id === colourId) ?? ICON_COLOURS[0];
  const { handlers, label } = useHoverLabel();

  const names = useMemo(() => (icons ? Object.keys(icons) : []), [icons]);
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const shown = q ? names.filter((n) => iconWords(n).includes(q)) : names;
    return shown.length ? [{ key: "heading", heading: "Icons" }, ...rowsOf(shown, "icons")] : [];
  }, [names, search]);

  const pick = (name) => onPick({ type: "icon", name, color: colour.hex });

  const cell = (name) => {
    const Icon = icons[name];
    return (
      <button
        key={name}
        type="button"
        data-label={iconWords(name)}
        onClick={() => pick(name)}
        className="flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-foreground/10"
      >
        <Icon className="size-5" style={{ color: colour.hex }} strokeWidth={2.25} />
      </button>
    );
  };

  return (
    <>
      <div className="flex items-center gap-2 px-3 pt-3">
        <FilterBox value={query} onChange={setQuery} />
        <Tip label="Random">
          <button
            type="button"
            onClick={() => names.length && pick(names[Math.floor(Math.random() * names.length)])}
            aria-label="Random"
            className={SQUARE}
          >
            <Shuffle className="size-4" />
          </button>
        </Tip>
        <ColourPicker colour={colour} />
      </div>

      <div className="relative pt-1">
        {!icons || rows.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground" style={{ height: HEIGHT, paddingTop: 24 }}>
            {!icons ? "Loading icons…" : "No icons match that."}
          </p>
        ) : (
          // a new key per filter starts the list back at the top
          <Windowed key={search} rows={rows} height={HEIGHT} renderCell={cell} hover={handlers} />
        )}
        {label}
      </div>
    </>
  );
}

// the colour icons are picked in, as a dot; click it for the ten
function ColourPicker({ colour }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tip label="Select icon color">
        <PopoverTrigger aria-label="Select icon color" className={SQUARE}>
          <span className="size-4 rounded-full transition-colors" style={{ background: colour.hex }} />
        </PopoverTrigger>
      </Tip>
      <PopoverContent align="end" className="grid w-auto grid-cols-5 gap-1.5 p-2.5">
        {ICON_COLOURS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              ICON_COLOUR.set(c.id);
              setOpen(false);
            }}
            aria-label={c.id}
            className={cn(
              "flex size-7 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110",
              colour.id === c.id && "ring-2 ring-foreground/40 ring-offset-2 ring-offset-popover",
            )}
          >
            <span className="size-5 rounded-full" style={{ background: c.hex }} />
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
