"use client";

// One wish on the vision board. It shows where the work for it happens and how many days you showed up for it —
// counted up, never a percentage of a finish line — and it can be marked achieved.

import { useState } from "react";
import { Check } from "lucide-react";
import { daysForBlocks } from "@/lib/year-stats";
import { BlockChips } from "./block-chips";
import { WishEditor } from "./wish-editor";
import { WishMenu } from "./wish-menu";

export function WishCard({ wish, colour, rows, statsReady, onChange, onAchieve, onSetDown, onDelete }) {
  // shaping the wish in place: its words, its blocks, its if-then
  const [editing, setEditing] = useState(false);
  const days = statsReady ? daysForBlocks(rows, wish.blocks) : null;

  return (
    <article
      className="flex min-h-56 flex-col gap-4 rounded-3xl p-6"
      style={{ backgroundColor: colour.bg, color: colour.ink }}
    >
      {editing ? (
        <WishEditor wish={wish} onChange={onChange} onDone={() => setEditing(false)} />
      ) : (
        <>
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 break-words text-2xl leading-snug">{wish.text}</h3>
            <WishMenu onEdit={() => setEditing(true)} onSetDown={onSetDown} onDelete={onDelete} />
          </div>

          {wish.ifThen && <p className="text-sm opacity-75">If it gets hard: {wish.ifThen}</p>}

          <div className="mt-auto flex flex-col gap-3">
            {wish.blocks.length > 0 ? (
              <>
                {days != null && (
                  <p className="text-sm opacity-80">
                    <span className="text-3xl font-medium tabular-nums">{days}</span>{" "}
                    {days === 1 ? "day" : "days"} you showed up for it
                  </p>
                )}
                <div className="w-fit rounded-xl bg-white/70 p-1.5">
                  <BlockChips ids={wish.blocks} />
                </div>
              </>
            ) : (
              // the plan is what turns a wish into days; it's offered, never required
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="w-fit cursor-pointer rounded-lg bg-white/60 px-3 py-1.5 text-sm transition-colors hover:bg-white/80"
              >
                Link the blocks where it happens
              </button>
            )}

            <button
              type="button"
              onClick={onAchieve}
              className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg bg-black/80 px-3 py-1.5 text-sm text-white transition-colors hover:bg-black"
            >
              <Check className="size-4" strokeWidth={3} />
              I achieved this
            </button>
          </div>
        </>
      )}
    </article>
  );
}
