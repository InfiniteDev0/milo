// The phone tab's picture: one day on the screen and the glass bar under it.

import { LayoutGrid, Plus } from "lucide-react";
import { maskStyle } from "@/lib/mask";
import { DayColumn } from "./mocks";
import { DAYS } from "./data";

const TABS = [
  { title: "Home", svg: "/home.svg", on: true },
  { title: "Notes", svg: "/pencil.svg" },
];

export function Phone() {
  return (
    <div className="relative flex h-[22rem] w-52 flex-col gap-3 overflow-hidden rounded-[2.2rem] bg-[#f6f5f2] p-3 pt-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]">
      <span className="mx-auto h-1.5 w-14 shrink-0 rounded-full bg-black/80" />
      <div className="flex flex-col gap-2 [&>div>div]:bg-white">
        <DayColumn {...DAYS[1]} />
      </div>
      {/* the floating bar and its + */}
      <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
        <div className="flex flex-1 rounded-full bg-white/90 p-1 shadow-lg backdrop-blur">
          {TABS.map((t) => (
            <span key={t.title} className={t.on ? "flex flex-1 flex-col items-center gap-0.5 rounded-full bg-black/[0.07] py-1" : "flex flex-1 flex-col items-center gap-0.5 py-1 text-black/50"}>
              <span aria-hidden className="size-3.5 bg-current" style={maskStyle(t.svg)} />
              <span className="text-[8px]">{t.title}</span>
            </span>
          ))}
          <span className="flex flex-1 flex-col items-center gap-0.5 py-1 text-black/50">
            <LayoutGrid className="size-3.5" />
            <span className="text-[8px]">More</span>
          </span>
        </div>
        <span className="flex size-9 items-center justify-center rounded-full bg-white/90 shadow-lg">
          <Plus className="size-4" />
        </span>
      </div>
    </div>
  );
}
