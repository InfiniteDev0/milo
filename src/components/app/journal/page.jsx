"use client";

// One page of the open journal: blank dotted paper, the writing, and its number.

import { bookHand } from "./font";
import { DOT, INK, LINE, PAGE_RADIUS, PAPER, TOP, textBox } from "./paper";

// paper darkening into the spine, which is on the right of a left page and the left of a right one
const fold = (side) =>
  `linear-gradient(to ${side === 0 ? "left" : "right"}, rgba(60,45,30,0.13), rgba(60,45,30,0.04) 3.5%, transparent 9%)`;

export function Page({ side, number, children }) {
  return (
    <div className="group/page absolute inset-0" style={{ containerType: "size" }}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `${fold(side)}, ${PAPER}`, borderRadius: PAGE_RADIUS[side] }}
      />
      {/* a dot where each writing line meets the next, kept in from the edges */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[6cqw] inset-y-[4cqh]"
        style={{
          backgroundImage: `radial-gradient(circle, ${DOT} 0.16cqh, transparent 0.22cqh)`,
          backgroundSize: `${LINE}cqh ${LINE}cqh`,
          backgroundPosition: `center ${TOP - 4 - LINE / 2}cqh`,
        }}
      />
      {children}
      <span
        aria-hidden
        className={`${bookHand.className} pointer-events-none absolute bottom-[4cqh] text-[2.6cqh] opacity-45`}
        style={{ color: INK, [side === 0 ? "left" : "right"]: "14cqw" }}
      >
        {number}
      </span>
    </div>
  );
}

// a page's writing when it can't be edited, like while it turns
export function PageWords({ side, text, head = false, foot = false }) {
  return (
    <div
      className={`${bookHand.className} absolute overflow-hidden break-words whitespace-pre-wrap`}
      style={textBox(side, { head, foot })}
    >
      {text}
    </div>
  );
}

// shade that follows the paper's rounded corners, not the box round it
export const paperMask = (side) => ({ borderRadius: PAGE_RADIUS[side] });
