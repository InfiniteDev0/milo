"use client";

/* The month: which blocks it's made of, and what goes in each one.
 *
 * This is the composing surface. Every block is a column with every task in it: set a task's days, drag it to
 * another block, open it in full, or add to it. The day view then just runs what the month defined.
 *
 * Counts here only ever go up. There is no target for a block to fall short
 * of, because nobody was asked to set one.
 */

import { useState } from "react";
import { ScopeSwitcher } from "@/components/app/scope-switcher";
import { useBlocks } from "@/components/app/blocks-provider";
import { MonthHistory } from "@/components/app/month-history";
import { BlockColumns } from "@/components/app/month/block-columns";

const ICONS = ["🌙", "🌱", "🔥", "📖", "🧭", "🛠️", "🌊", "☀️", "🏔️", "✍️"];

export default function MonthlyPage() {
  const [pickingIcon, setPickingIcon] = useState(false);
  const { blocks, profile, setProfile, tasks, hydrated } = useBlocks();

  return (
    <div className="flex h-full flex-col gap-5 px-8 pt-5 sm:px-12">
      <div className="flex shrink-0 items-center justify-between gap-4">
        {/* The name you gave this month, editable where it is shown. There is
            no settings screen for it and no pencil to find — it is your word
            for the month, so it should be as easy to change as it was to
            write. */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setPickingIcon((v) => !v)}
            aria-label="Change the icon"
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-2xl transition-colors hover:bg-foreground/5"
          >
            {profile?.month?.icon ?? "🌙"}
          </button>

          <input
            value={profile?.month?.name ?? ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                month: { ...(profile?.month ?? {}), name: e.target.value },
              })
            }
            // not the month's calendar name — the calendar below already says that; this is the word only you supply
            placeholder="Name this month"
            aria-label="Name this month"
            className="min-w-0 flex-1 bg-transparent text-2xl uppercase outline-none placeholder:text-foreground/25"
          />
        </div>

        <div className="flex items-center gap-3">
          <ScopeSwitcher />
        </div>
      </div>

      {pickingIcon && (
        <div className="flex shrink-0 flex-wrap gap-1 pb-1">
          {ICONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                setProfile({
                  ...profile,
                  month: { ...(profile?.month ?? {}), icon: e },
                });
                setPickingIcon(false);
              }}
              aria-label={`Pick ${e}`}
              className={`flex size-9 cursor-pointer items-center justify-center rounded-lg text-lg transition-colors ${
                profile?.month?.icon === e ? "bg-foreground/10" : "hover:bg-foreground/5"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* pl-1 leaves room for rings and focus outlines, which paint outside their element */}
      <div className="scrollbar-pill min-h-0 flex-1 overflow-y-auto overscroll-contain pl-1 pr-3 pb-6">
        <div className="flex flex-col gap-3">
          {/* the counts wait for the real ones, rather than showing zero and correcting it */}
          {hydrated ? (
            <p className="text-sm text-foreground/45">
              {blocks.length} {blocks.length === 1 ? "block" : "blocks"} · {tasks.length}{" "}
              {tasks.length === 1 ? "task" : "tasks"} · drag a task onto another block to move it
            </p>
          ) : (
            <div className="h-5 w-56 animate-pulse rounded bg-foreground/6" />
          )}

          <BlockColumns />
        </div>

        {/* what already happened, below what is still being composed */}
        <div className="pt-6">
          <MonthHistory />
        </div>
      </div>
    </div>
  );
}
