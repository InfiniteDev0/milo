"use client";

// A day plan's left page: the date, the blocks pinned for reference, and the hours to write against.

import { useBlocks } from "../blocks-provider";
import { bookSerif } from "./font";
import { HandLine } from "./hand-line";
import { LINE, pageBox } from "./paper";
import { pageDate } from "./pages";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
const hourLabel = (h) => `${((h + 11) % 12) + 1}:00`;

export function DaySchedule({ page, side, edit, onPatch }) {
  const { blocks, droppedToday, archived } = useBlocks();
  const every = [...blocks, ...droppedToday, ...archived];
  const pinned = page.blocks.map((id) => every.find((b) => b.id === id)).filter(Boolean);
  const d = pageDate(page);
  const hours = page.data.hours ?? {};

  return (
    <div className="absolute flex flex-col" style={pageBox(side)}>
      <div
        className={`${bookSerif.className} flex shrink-0 items-baseline gap-[1.5cqw]`}
        style={{ height: `${LINE * 2}cqh`, fontSize: `${LINE * 0.8}cqh` }}
      >
        <span className="font-semibold">{d.toLocaleDateString(undefined, { weekday: "long" })}</span>
        <span>{d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
      </div>

      {/* the day's blocks, pinned as they are, for reference */}
      <div className="flex shrink-0 items-center gap-[1cqw] overflow-hidden" style={{ height: `${LINE}cqh` }}>
        {pinned.map((b) => (
          <span
            key={b.id}
            className="truncate rounded-[0.6cqh] px-[1.4cqw] font-sans"
            style={{ backgroundColor: b.bg, color: b.ink, fontSize: `${LINE * 0.36}cqh`, lineHeight: `${LINE * 0.62}cqh` }}
          >
            {b.name.replace(" Block", "")}
          </span>
        ))}
      </div>

      {HOURS.map((h) => (
        <div key={h} className="flex shrink-0 items-end gap-[2cqw]">
          <span
            className="w-[9cqw] shrink-0 font-sans tabular-nums opacity-55"
            style={{ fontSize: `${LINE * 0.36}cqh`, lineHeight: `${LINE}cqh` }}
          >
            {hourLabel(h)}
          </span>
          <HandLine
            value={hours[h] ?? ""}
            edit={edit}
            label={hourLabel(h)}
            onChange={(v) => onPatch({ data: { ...page.data, hours: { ...hours, [h]: v } } })}
          />
        </div>
      ))}
    </div>
  );
}
