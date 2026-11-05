"use client";

/* Every emoji, from emojibase: a filter (by name or any word for it), Random,
   and the skin tone, then the emoji in their sections, with a bar along the
   bottom to jump between them — Recent first, when there are any. Only the rows
   in view are drawn (windowed.jsx). The data is fetched as the picker opens. */

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Carrot, CircleCheck, Clock, Flag, Leaf, Lightbulb, Plane, Shuffle, Smile, Volleyball } from "lucide-react";
import { usePreference } from "@/hooks/use-preference";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tip } from "../tasks-view/tip";
import { useHoverLabel } from "./hover-label";
import { FilterBox, SQUARE } from "./filter-box";
import { SKIN_TONE, TONE_HANDS, readRecent, rememberEmoji, withTone } from "./shared";
import { ROW, Windowed, rowsOf } from "./windowed";

// emojibase's groups, as the reference sorts them (2, skin tone parts, is left out)
const SECTIONS = [
  { id: "people", label: "People", groups: [0, 1], Icon: Smile },
  { id: "nature", label: "Animals & nature", groups: [3], Icon: Leaf },
  { id: "food", label: "Food & drink", groups: [4], Icon: Carrot },
  { id: "activity", label: "Activities", groups: [6], Icon: Volleyball },
  { id: "travel", label: "Travel & places", groups: [5], Icon: Plane },
  { id: "objects", label: "Objects", groups: [7], Icon: Lightbulb },
  { id: "symbols", label: "Symbols", groups: [8], Icon: CircleCheck },
  { id: "flags", label: "Flags", groups: [9], Icon: Flag },
];
export const EMOJI_HEIGHT = 288;

let data = null;
let loading = null;
// the picker calls this as it opens, so the emoji are usually here before the tab draws
export const preloadEmoji = () =>
  (loading ??= import("emojibase-data/en/compact.json").then((m) => (data = m.default.filter((e) => e.group != null && e.group !== 2))));

export function EmojiTab({ onPick }) {
  const [emoji, setEmoji] = useState(data);
  const [query, setQuery] = useState("");
  // typing stays quick; the matches catch up a beat behind
  const search = useDeferredValue(query);
  const [active, setActive] = useState(null);
  // read once when the picker opens; it changes as you pick, but the list shouldn't jump while open
  const [recent] = useState(readRecent);
  const tone = Number(usePreference(SKIN_TONE));
  const box = useRef(null);
  const { handlers, label } = useHoverLabel();

  useEffect(() => {
    if (!data) preloadEmoji().then(setEmoji);
  }, []);

  // the sections, and every row they make: a heading, then rows of ten
  const { sections, rows } = useMemo(() => {
    if (!emoji) return { sections: [], rows: [] };
    const byUnicode = new Map(emoji.map((e) => [e.unicode, e]));
    const mine = recent.map((u) => byUnicode.get(u) ?? { unicode: u, label: "" });
    const all = [
      ...(mine.length ? [{ id: "recent", label: "Recent", Icon: Clock, items: mine }] : []),
      ...SECTIONS.map((s) => ({ ...s, items: emoji.filter((e) => s.groups.includes(e.group)) })),
    ];
    const rows = [];
    for (const s of all) {
      s.row = rows.length;
      rows.push({ key: s.id, heading: s.label }, ...rowsOf(s.items, s.id));
    }
    return { sections: all, rows };
  }, [emoji, recent]);

  const found = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || !emoji) return null;
    return rowsOf(
      emoji.filter((e) => e.label.toLowerCase().includes(q) || e.tags?.some((t) => t.includes(q))),
      "found",
    );
  }, [emoji, search]);

  const pick = (e) => {
    const unicode = withTone(e, tone);
    rememberEmoji(unicode);
    onPick({ type: "emoji", value: unicode });
  };

  const random = () => {
    if (emoji) pick(emoji[Math.floor(Math.random() * emoji.length)]);
  };

  // the bar glides to a section; scrolling marks the section in view
  const jump = (s) => box.current?.scrollTo({ top: s.row * ROW, behavior: "smooth" });
  const inView = (top) => {
    let current = sections[0]?.id;
    for (const s of sections) if (s.row * ROW <= top + 8) current = s.id;
    if (current !== active) setActive(current);
  };
  const shownActive = active ?? sections[0]?.id;

  const cell = (e, i) => (
    <button
      key={`${e.unicode}-${i}`}
      type="button"
      data-label={e.label}
      onClick={() => pick(e)}
      className="flex size-8 cursor-pointer items-center justify-center rounded-md text-[22px] leading-none transition-colors hover:bg-foreground/10"
    >
      {withTone(e, tone)}
    </button>
  );

  return (
    <>
      <div className="flex items-center gap-2 px-3 pt-3">
        <FilterBox value={query} onChange={setQuery} />
        <Tip label="Random">
          <button type="button" onClick={random} aria-label="Random" className={SQUARE}>
            <Shuffle className="size-4" />
          </button>
        </Tip>
        <TonePicker tone={tone} />
      </div>

      <div className="relative pt-1">
        {!emoji ? (
          <p className="text-center text-xs text-muted-foreground" style={{ height: EMOJI_HEIGHT, paddingTop: 24 }}>
            Loading emoji…
          </p>
        ) : found?.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground" style={{ height: EMOJI_HEIGHT, paddingTop: 24 }}>
            No emoji match that.
          </p>
        ) : (
          // a new key per filter starts the list back at the top
          <Windowed
            key={found ? `found:${search}` : "all"}
            rows={found ?? rows}
            height={EMOJI_HEIGHT}
            renderCell={cell}
            boxRef={box}
            onScroll={found ? undefined : inView}
            hover={handlers}
          />
        )}
        {label}
      </div>

      {/* the sections, along the bottom; while filtering they've nothing to jump to */}
      <nav
        aria-label="Emoji sections"
        className={cn(
          "flex items-center justify-between border-t border-foreground/10 px-2 py-1.5 transition-opacity",
          found && "pointer-events-none opacity-40",
        )}
      >
        {sections.map((s) => (
          <Tip key={s.id} label={s.label}>
            <button
              type="button"
              onClick={() => jump(s)}
              aria-label={s.label}
              className={cn(
                "flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-foreground/10",
                !found && shownActive === s.id ? "bg-foreground/10 text-foreground" : "text-muted-foreground",
              )}
            >
              <s.Icon className="size-4" />
            </button>
          </Tip>
        ))}
      </nav>
    </>
  );
}

// the hand in the tone the emoji take; click it for the six
function TonePicker({ tone }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tip label="Skin tone">
        <PopoverTrigger aria-label="Skin tone" className={cn(SQUARE, "text-lg leading-none")}>
          {TONE_HANDS[tone]}
        </PopoverTrigger>
      </Tip>
      <PopoverContent align="end" className="w-auto flex-row gap-0.5 p-1">
        {TONE_HANDS.map((hand, i) => (
          <button
            key={hand}
            type="button"
            onClick={() => {
              SKIN_TONE.set(String(i));
              setOpen(false);
            }}
            aria-label={i === 0 ? "Default tone" : `Skin tone ${i}`}
            className={cn(
              "flex size-8 cursor-pointer items-center justify-center rounded-md text-lg leading-none transition-colors hover:bg-foreground/10",
              tone === i && "bg-foreground/10",
            )}
          >
            {hand}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
