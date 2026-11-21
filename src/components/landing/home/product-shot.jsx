// The hero's picture of Milo: the coloured rail, three days of tasks, and notes at the side.

import { maskStyle } from "@/lib/mask";
import { DayColumn, NoteCard } from "./mocks";
import { DAYS, NOTES } from "./data";

const RAIL = ["/home.svg", "/pencil.svg", "/calendar.svg"];

export function ProductShot() {
  return (
    <div className="w-full rounded-[22px] bg-[#f4f2ee] p-1.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.3)]">
      <div className="flex h-[26rem] overflow-hidden rounded-[18px] bg-white md:h-[34rem]">
        {/* the rail, in the theme colour, darker toward the bottom */}
        <div className="hidden w-16 shrink-0 flex-col items-center gap-3 bg-gradient-to-b from-[#6d2cf0] to-[#2a0a6b] py-4 sm:flex">
          {RAIL.map((src, i) => (
            <span key={src} className={i === 0 ? "flex size-10 items-center justify-center rounded-xl bg-white/30" : "flex size-10 items-center justify-center"}>
              <span aria-hidden className={i === 0 ? "size-5 bg-black" : "size-5 bg-white"} style={maskStyle(src)} />
            </span>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <span className="flex rounded-full bg-black/5 p-0.5 text-[12px]">
              <span className="rounded-full bg-[#5e17eb] px-3 py-1 text-white">Tasks</span>
              <span className="px-3 py-1 text-black/50">Blocks</span>
            </span>
            <span className="text-[12px] text-black/40">November</span>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
            {DAYS.map((d, i) => (
              <div key={d.day} className={i === 0 ? "hidden lg:flex" : i === 2 ? "hidden sm:flex" : "flex"}>
                <DayColumn {...d} />
              </div>
            ))}
          </div>
        </div>

        {/* notes, as the Notes page lays them out */}
        <div className="hidden w-72 shrink-0 flex-col gap-3 bg-[#f6f5f2] p-4 md:flex">
          <span className="text-[13px] text-black/70">Notes</span>
          <div className="grid grid-cols-2 gap-2.5">
            {NOTES.map((n) => (
              <NoteCard key={n.title} {...n} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
