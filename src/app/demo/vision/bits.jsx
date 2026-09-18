// Small pieces the windows share: a block chip, a hand-drawn tick, and a wish line.

import { hand } from "./font";
import { BLOCKS } from "./data";

export function Chip({ id }) {
  const b = BLOCKS[id];
  return (
    <span className="inline-flex rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: b.bg, color: b.ink }}>
      {b.name}
    </span>
  );
}

export function Tick() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" aria-hidden>
      <path d="M4 13c2.5 2 3.8 3.6 5 5.5C11.8 12 15.5 7.6 20.5 4.5" stroke="#3f8f5a" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function Box() {
  return <span aria-hidden className="mt-0.5 size-4 shrink-0 rounded-[3px] border-[1.5px] border-current opacity-60" />;
}

// a wish as a line in a list window; achieved ones get a tick and when
export function WishLine({ text, achieved }) {
  return (
    <li className="flex items-start gap-2.5">
      {achieved ? <Tick /> : <Box />}
      <span className={`${hand.className} text-xl leading-snug`}>
        {text}
        {achieved && <span className="pl-2 text-sm opacity-60">· went in {achieved}</span>}
      </span>
    </li>
  );
}

// days you showed up for it, counted up
export function Days({ n }) {
  return (
    <p className="text-sm opacity-80">
      <span className={`${hand.className} text-3xl`}>{n}</span> days you showed up for it
    </p>
  );
}
