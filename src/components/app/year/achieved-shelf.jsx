"use client";

// What you already achieved this year, first on the page: the wish, when, the days you put in, and how it happened.
// Looking back at a win is part of keeping going, so this shelf is never hidden.

import MiloFace from "@/components/MiloFace";
import { daysForBlocks } from "@/lib/year-stats";
import { BlockChips } from "./block-chips";

const when = (ms) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "long" });

export function AchievedShelf({ vision, rows, statsReady }) {
  const { wishes, updateWish } = vision;
  const done = wishes
    .filter((w) => w.status === "achieved")
    .sort((a, b) => (b.achievedAt ?? 0) - (a.achievedAt ?? 0));

  if (done.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-chip">
          <MiloFace mood="proud" instant gaze={false} reactToScroll={false} className="size-8" />
        </span>
        <h2 className="text-lg">
          Achieved this year <span className="text-foreground/45 tabular-nums">· {done.length}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {done.map((wish) => {
          const days = statsReady && wish.blocks.length > 0 ? daysForBlocks(rows, wish.blocks) : null;
          return (
            <article
              key={wish.id}
              className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-card p-5 shadow-[0_4px_0_var(--card-lift)]"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-sm text-white">
                  ✓
                </span>
                <h3 className="min-w-0 flex-1 break-words text-lg leading-snug">{wish.text}</h3>
              </div>

              <p className="text-xs text-foreground/50">
                {wish.achievedAt ? `Achieved ${when(wish.achievedAt)}` : "Achieved"}
                {days != null && ` · ${days} ${days === 1 ? "day" : "days"} you showed up for it`}
              </p>

              <BlockChips ids={wish.blocks} />

              <textarea
                value={wish.note}
                onChange={(e) => updateWish(wish.id, { note: e.target.value })}
                placeholder="How it happened, in a line or two"
                aria-label={`How ${wish.text} happened`}
                rows={2}
                className="w-full resize-none rounded-lg bg-foreground/4 px-3 py-2 text-sm leading-relaxed outline-none [field-sizing:content] placeholder:text-foreground/30"
              />

              <button
                type="button"
                onClick={() => updateWish(wish.id, { status: "open", achievedAt: null })}
                className="w-fit cursor-pointer text-xs text-foreground/40 transition-colors hover:text-foreground"
              >
                Put it back on the board
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
