"use client";

// The year so far: only the months you showed up in, each with the name you gave it, the days, and the blocks that ran.
// No row of empty months and no months ahead — a month with nothing in it is simply absent.

import { monthsOfYear } from "@/lib/year-stats";
import { useBlocks } from "../blocks-provider";
import { BlockChips } from "./block-chips";
import { MonthName } from "./month-name";

const calendarName = (year, m) => new Date(year, m - 1, 1).toLocaleDateString(undefined, { month: "long" });

export function YearMonths({ year, rows, ready, failed }) {
  const { todayStamp } = useBlocks();

  const heading = <h2 className="text-sm text-foreground/45">The year so far</h2>;

  if (failed) {
    return (
      <section className="flex flex-col gap-3">
        {heading}
        <p className="text-sm text-foreground/45">Couldn’t reach this year’s days. Nothing is lost.</p>
      </section>
    );
  }

  if (!ready) {
    return (
      <section className="flex flex-col gap-3">
        {heading}
        <div className="grid animate-pulse grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-36 rounded-2xl bg-foreground/5" />
          ))}
        </div>
      </section>
    );
  }

  const months = monthsOfYear(rows).reverse();
  // "2026-9" from today's "2026-9-17"
  const currentStamp = todayStamp.split("-").slice(0, 2).join("-");

  return (
    <section className="flex flex-col gap-3">
      {heading}

      {months.length === 0 ? (
        <p className="text-sm text-foreground/45">Your months show up here as you live them.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {months.map(({ month, days, ran }) => {
            const stamp = `${year}-${month}`;
            const isCurrent = stamp === currentStamp;
            const ids = Object.keys(ran).sort((a, b) => ran[b] - ran[a]);

            return (
              <article
                key={month}
                className={`flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ${
                  isCurrent ? "ring-foreground/30" : "ring-foreground/8"
                }`}
              >
                <MonthName stamp={stamp} calendar={calendarName(year, month)} isCurrent={isCurrent} />

                <p className="text-sm">
                  Showed up <span className="font-medium tabular-nums">{days}</span> {days === 1 ? "day" : "days"}
                </p>

                <BlockChips ids={ids} counts={ran} />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
