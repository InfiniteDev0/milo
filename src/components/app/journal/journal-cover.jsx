"use client";

// The default cover: dark brushed leaves with a cream label in the middle — "Journal", then the year.
// The label is sized in cqw (a share of the book's width), so it looks the same on a small book and a big one.

import Image from "next/image";
import { bookSerif } from "./font";

// read once when the page loads, so the server and the browser agree on it
const YEAR = new Date().getFullYear();

export function JournalCover() {
  return (
    <div className="@container relative h-full w-full">
      {/* next/image sends a small resized copy, not the full 1414×2000 file */}
      <Image src="/journalbg2.png" alt="" fill sizes="16rem" className="object-cover" draggable={false} />

      <div className="absolute inset-x-[12%] top-1/2 -translate-y-1/2 bg-[#FBF5EF] p-[1.5cqw] text-[#2b2b2b]">
        <div className="flex flex-col items-center gap-[2cqw] border border-[#2b2b2b]/40 px-[4cqw] pt-[4cqw] pb-[3cqw]">
          <span className={`${bookSerif.className} text-[15cqw] italic leading-none`}>Journal</span>
          <span className="h-px w-full bg-[#2b2b2b]/40" />
          <span className="flex w-full items-center justify-between text-[3.4cqw] tracking-[0.15em]">
            DAILY NOTEBOOK
            <span className="h-[4cqw] w-px bg-[#2b2b2b]/40" />
            {YEAR}
          </span>
        </div>
      </div>
    </div>
  );
}
