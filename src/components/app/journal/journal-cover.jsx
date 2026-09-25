"use client";

// A journal's cover: the chosen art, with the label in the middle — "Journal", then the year.
// The label is sized in cqw (a share of the book's width), so it looks the same on a small book and a big one.

import Image from "next/image";
import { bookSerif } from "./font";
import { coverById } from "./covers";

// read once when the page loads, so the server and the browser agree on it
const YEAR = new Date().getFullYear();

export function JournalCover({ cover }) {
  const skin = coverById(cover);

  return (
    <div className="@container relative h-full w-full">
      {/* next/image sends a small resized copy, not the full-size file */}
      <Image src={skin.image} alt="" fill sizes="16rem" className="object-cover" draggable={false} />

      <div
        className="absolute inset-x-[12%] -translate-y-1/2 p-[1.5cqw]"
        style={{ top: skin.at, background: skin.card, color: skin.ink }}
      >
        <div
          className="flex flex-col items-center gap-[2cqw] border px-[4cqw] pt-[4cqw] pb-[3cqw]"
          style={{ borderColor: `color-mix(in oklab, ${skin.ink} 40%, transparent)` }}
        >
          <span className={`${bookSerif.className} text-[15cqw] leading-none italic`}>Journal</span>
          <span className="h-px w-full" style={{ background: `color-mix(in oklab, ${skin.ink} 40%, transparent)` }} />
          <span className="flex w-full items-center justify-between text-[3.4cqw] tracking-[0.15em]">
            DAILY NOTEBOOK
            <span
              className="h-[4cqw] w-px"
              style={{ background: `color-mix(in oklab, ${skin.ink} 40%, transparent)` }}
            />
            {YEAR}
          </span>
        </div>
      </div>
    </div>
  );
}
