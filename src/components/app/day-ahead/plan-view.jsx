"use client";

// One day, one block at a time — the lineup as names, then a single block's tasks. Never the whole day in one list.

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { stampLabel } from "@/lib/day-ahead";
import { nextStamp } from "@/lib/stamp";
import { useBlocks } from "../blocks-provider";
import { NoteRowsSkeleton } from "../notes/skeletons";
import { Segmented } from "../settings/row";
import { BlockPills } from "./block-pills";
import { BlockPlan } from "./block-plan";
import { DayNotes } from "./day-notes";

const TABS = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
];

export function PlanView({ tab, onTab, onOpenNote }) {
  const { lineup, todayStamp, hydrated, loadFailed } = useBlocks();
  const [at, setAt] = useState(0);

  const ahead = tab === "tomorrow";
  const stamp = ahead ? nextStamp(todayStamp) : todayStamp;
  // a block removed since can't leave the pointer past the end
  const index = Math.min(at, Math.max(lineup.length - 1, 0));
  const block = lineup[index] ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <DialogPrimitive.Title className="text-xl font-medium">Day ahead</DialogPrimitive.Title>
          <span className="truncate text-xs text-foreground/45">
            {stampLabel(stamp)} · nothing here is fixed
          </span>
        </div>

        <DialogPrimitive.Close
          aria-label="Close"
          style={{ "--lift": "var(--card-lift)" }}
          className="milo-lift flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-foreground/10 bg-card text-foreground/50 transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </div>

      <div className="shrink-0 px-5 pb-4">
        <Segmented label="Which day" value={tab} options={TABS} onChange={onTab} />
      </div>

      {loadFailed ? (
        // a failed read knows nothing about your day, so it never says it's empty
        <p className="px-8 pt-10 text-center text-sm text-foreground/45">
          Couldn&rsquo;t reach your blocks. Nothing is lost.
        </p>
      ) : !hydrated ? (
        <NoteRowsSkeleton />
      ) : lineup.length === 0 ? (
        <p className="px-8 pt-10 text-center text-sm text-foreground/45">
          No blocks yet. Add them from the Month view.
        </p>
      ) : (
        <>
          <BlockPills blocks={lineup} at={index} stamp={stamp} ahead={ahead} onPick={setAt} />

          <div className="scrollbar-pill flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pb-6">
            <BlockPlan
              block={block}
              stamp={stamp}
              ahead={ahead}
              onOpenNote={onOpenNote}
              onPrev={index > 0 ? () => setAt(index - 1) : null}
              onNext={index < lineup.length - 1 ? () => setAt(index + 1) : null}
            />
            <DayNotes stamp={stamp} ahead={ahead} onOpenNote={onOpenNote} />
          </div>
        </>
      )}
    </div>
  );
}
