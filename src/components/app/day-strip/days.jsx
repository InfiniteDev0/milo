"use client";

// A month of days you can park something on. Forward only — you cannot plan
// into a day that has already gone, which is also how nothing here can be late.

import { Plus } from "lucide-react";
import { CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { DAY } from "@/lib/palette";

export const DAYS_AHEAD = 30;

const WEEKDAY = { weekday: "short" };
const MONTHDAY = { month: "short", day: "numeric" };

export function Days() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  // px-5 matches the header, so the first column's edge lines up with Today
  return (
    <CarouselContent insetClassName="px-5">
      {days.map((d, i) => (
        <CarouselItem key={d.toDateString()} className="basis-full sm:basis-1/3 lg:basis-1/5">
          <div className="flex flex-col gap-2">
            <span className="flex items-baseline gap-1.5 text-base font-semibold">
              {/* Every column keeps its weekday — today is the one in the pill.
                  Swapping the name for the word Today lost it, and Friday IS the
                  name of today, until Saturday is. */}
              {i === 0 ? (
                <span className="rounded-md bg-[#141414] px-2 py-0.5 text-sm text-white">
                  {d.toLocaleDateString([], WEEKDAY)}
                </span>
              ) : (
                <span style={{ color: DAY }}>{d.toLocaleDateString([], WEEKDAY)}</span>
              )}
              <span className="font-normal text-black/35">
                {d.toLocaleDateString([], MONTHDAY)}
              </span>
            </span>

            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-left text-sm text-black/35 transition-colors hover:border-black/25 hover:text-black/60"
            >
              <Plus className="size-4" />
              Add a task
            </button>
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
  );
}
