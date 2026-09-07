"use client";

/* The year: what you named it, what you said it was about, and the vision
 * board — all of it straight from setup, in the user's own words.
 *
 * The category rollup (Learning / Self-growth / Health / Habits / Work) comes
 * later; it needs months of history to roll up, and inventing a chart out of
 * one day would be a lie about a year.
 */

import { ScopeSwitcher } from "@/components/app/scope-switcher";
import { useBlocks } from "@/components/app/blocks-provider";

// The board borrows the block palette so the year looks like the same product
// as the day.
const VISION_COLOURS = [
  { bg: "#F5C542", ink: "#1a1400" },
  { bg: "#F5836A", ink: "#2b0d05" },
  { bg: "#5ECBA1", ink: "#04231a" },
  { bg: "#A78BFA", ink: "#1c0f3d" },
  { bg: "#7FC6F5", ink: "#04202b" },
];

/* Held while localStorage is read. Without it the page renders 'This year'
   with no vision board for a beat — which looks like a year you never filled
   in, and then corrects itself. */
function YearSkeleton() {
  return (
    <div className="flex max-w-2xl animate-pulse flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-40 rounded bg-black/[0.06]" />
        <div className="h-6 w-full rounded bg-black/[0.04]" />
        <div className="h-6 w-3/4 rounded bg-black/[0.04]" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-4 w-28 rounded bg-black/[0.06]" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="aspect-4/3 rounded-2xl bg-black/[0.04]"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-4 w-28 rounded bg-black/[0.06]" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="h-9 w-28 rounded-full bg-black/[0.04]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function YearlyPage() {
  const { profile, blocks, hydrated } = useBlocks();
  const year = profile?.year;

  return (
    <div className="flex h-full flex-col gap-5 px-6 pt-5 sm:px-10">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {year?.icon && <span className="text-2xl">{year.icon}</span>}
          {hydrated ? (
            <h1 className="truncate text-2xl">{year?.name || "This year"}</h1>
          ) : (
            <div className="h-7 w-44 animate-pulse rounded-lg bg-black/[0.06]" />
          )}
        </div>
        <ScopeSwitcher />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
        {!hydrated && <YearSkeleton />}

        <div className="flex max-w-2xl flex-col gap-8">
          {hydrated && year?.goals && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm text-black/45">
                What this year is about
              </h2>
              <p className="whitespace-pre-line text-lg leading-relaxed">
                {year.goals}
              </p>
            </section>
          )}

          {hydrated && year?.vision?.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm text-black/45">Vision board</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                {year.vision.map((v, i) => (
                  <div
                    key={`${v}-${i}`}
                    className="flex aspect-4/3 min-w-0 items-end rounded-2xl p-5 text-lg leading-snug"
                    style={{
                      background: VISION_COLOURS[i % VISION_COLOURS.length].bg,
                      color: VISION_COLOURS[i % VISION_COLOURS.length].ink,
                    }}
                  >
                    <span className="break-words">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {hydrated && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm text-black/45">Blocks in play</h2>
            <div className="flex flex-wrap gap-2">
              {blocks.map((b) => (
                <span
                  key={b.id}
                  className="rounded-full px-4 py-2 text-sm"
                  style={{ background: b.bg, color: b.ink }}
                >
                  {b.name.replace(" Block", "")}
                </span>
              ))}
            </div>
          </section>
          )}

          {hydrated && !year && (
            <p className="text-sm text-black/40">
              Your year gets its name and vision during setup.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
