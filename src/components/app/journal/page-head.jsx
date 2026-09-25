"use client";

// An entry's heading, set out like the paper page: type and date top right, the day and time below on the left.

import { bookHand } from "./font";
import { ENTRY_NAMES } from "./pages";
import { HEAD_LINES, INK, LINE, TOP, margins } from "./paper";

const clock = (d) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).replace(/\s/g, "").toLowerCase();

export function PageHead({ page, side }) {
  const d = new Date(page.createdAt);
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  return (
    <div
      className={`${bookHand.className} pointer-events-none absolute`}
      style={{
        top: `${TOP}cqh`,
        height: `${HEAD_LINES * LINE}cqh`,
        ...margins(side),
        lineHeight: `${LINE}cqh`,
        fontSize: `${LINE * 0.85}cqh`,
        color: INK,
      }}
    >
      <p className="text-right font-medium">{page.entry ? ENTRY_NAMES[page.entry] : "\u00a0"}</p>
      <p className="text-right">{d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>
      <p className="opacity-80">
        {weekday} — {clock(d)}
      </p>
    </div>
  );
}
