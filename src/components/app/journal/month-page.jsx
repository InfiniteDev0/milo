"use client";

// A month plan: the month as a small calendar, lines for what you want from it, and room to write.
// Days this journal has a page for carry a dot; nothing marks the days without one.

import { bookSerif } from "./font";
import { Band, HandArea, HandLine } from "./hand-line";
import { INK, LINE, pageBox } from "./paper";
import { pageDate } from "./pages";

const PLAN_LINES = 6;
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function MonthPage({ page, side, edit, onPatch, foot, marked }) {
  const first = pageDate(page);
  const y = first.getFullYear();
  const m = first.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  // weeks start on Monday
  const lead = (first.getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const now = new Date();
  const today = now.getFullYear() === y && now.getMonth() === m ? now.getDate() : null;
  const lines = page.data.lines ?? [];
  const rowH = (LINE * 5) / 7;

  return (
    <div className="absolute flex flex-col" style={pageBox(side)}>
      <div
        className={`${bookSerif.className} flex shrink-0 items-baseline justify-between`}
        style={{ height: `${LINE * 2}cqh`, fontSize: `${LINE * 0.9}cqh` }}
      >
        <span className="font-semibold">{first.toLocaleDateString(undefined, { month: "long" })}</span>
        <span className="opacity-60" style={{ fontSize: `${LINE * 0.6}cqh` }}>
          {y}
        </span>
      </div>

      <div
        className="grid shrink-0 grid-cols-7 font-sans"
        style={{ gridAutoRows: `${rowH}cqh`, fontSize: `${LINE * 0.34}cqh`, height: `${LINE * 5}cqh` }}
      >
        {WEEKDAYS.map((w, i) => (
          <span key={`w${i}`} className="flex items-center justify-center opacity-45">
            {w}
          </span>
        ))}
        {cells.map((d, i) => (
          <span key={i} className="relative flex items-center justify-center tabular-nums">
            {d && (
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  width: `${rowH * 0.95}cqh`,
                  height: `${rowH * 0.95}cqh`,
                  border: d === today ? `1px solid ${INK}` : "none",
                }}
              >
                {d}
              </span>
            )}
            {d && marked?.has(d) && (
              <span aria-hidden className="absolute bottom-0 size-[0.6cqh] rounded-full" style={{ background: INK }} />
            )}
          </span>
        ))}
      </div>

      <Band>This month</Band>
      {Array.from({ length: PLAN_LINES }, (_, i) => (
        <HandLine
          key={i}
          value={lines[i]}
          edit={edit}
          label={`Plan ${i + 1}`}
          onChange={(v) => {
            const next = [...lines];
            next[i] = v;
            onPatch({ data: { ...page.data, lines: next } });
          }}
        />
      ))}

      <Band>Notes</Band>
      <HandArea value={page.body} edit={edit} label="Notes" onChange={(v) => onPatch({ body: v })} />
      {foot}
    </div>
  );
}
