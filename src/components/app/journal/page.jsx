"use client";

// One page of the open journal: its half of the book photo, the writing, and its number.

import { bookHand } from "./font";
import { INK, LEAF_CLIP, PAGE_IMAGE, textBox } from "./paper";

// a turning leaf is one sheet, so it leaves the stack of page edges behind
export function Page({ side, number, leaf, children }) {
  return (
    <div
      className="absolute inset-0 bg-no-repeat"
      style={{
        backgroundImage: `url(${PAGE_IMAGE[side]})`,
        backgroundSize: "100% 100%",
        clipPath: leaf ? LEAF_CLIP[side] : undefined,
        containerType: "size",
      }}
    >
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
export function PageWords({ side, text }) {
  return (
    <div
      className={`${bookHand.className} absolute overflow-hidden break-words whitespace-pre-wrap`}
      style={textBox(side)}
    >
      {text}
    </div>
  );
}

// shade that follows the paper's shape, not the box round it
export const paperMask = (side) => ({
  maskImage: `url(${PAGE_IMAGE[side]})`,
  WebkitMaskImage: `url(${PAGE_IMAGE[side]})`,
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
});
