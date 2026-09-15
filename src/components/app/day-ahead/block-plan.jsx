"use client";

// One block on that day: its tasks, each able to sit the day out, the block set aside whole, and notes left for it.

import { ChevronLeft, ChevronRight, Eraser } from "lucide-react";
import { toast } from "sonner";
import { EMPTY_PLAN } from "@/lib/db/plans";
import { notesOn, tasksOn, weekdayName } from "@/lib/day-ahead";
import { useBlocks } from "../blocks-provider";
import { useNotes } from "../notes-provider";
import { LighterToast } from "./lighter-toast";
import { NoteLines } from "./note-lines";
import { TaskLine } from "./task-line";

const STEP =
  "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground/55 transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-default disabled:opacity-25 disabled:hover:bg-transparent";

export function BlockPlan({ block, stamp, ahead, onPrev, onNext, onOpenNote }) {
  const { tasks, plans, canPlan, lineup, skipTask, setAsideAhead, dropBlock, undropBlock } = useBlocks();
  const { notes, canWrite, addNote } = useNotes();

  if (!block) return null;

  const plan = plans[stamp] ?? EMPTY_PLAN;
  const name = block.name.replace(" Block", "");
  const mine = tasksOn(tasks, block.id, stamp, ahead);
  const skipped = new Set(plan.skipped);
  const aside = ahead ? plan.setAside.includes(block.id) : block.dropped;
  // today, only a block that hasn't run can step aside; tomorrow needs the plan to be readable
  const canAside = ahead ? canPlan : block.status === "todo";
  const waiting = notesOn(notes, stamp, block.id, new Set(lineup.map((b) => b.id)));

  // said once, when the day gets lighter — never when something comes back
  const lighter = () =>
    toast.custom(() => <LighterToast ahead={ahead} />, {
      unstyled: true,
      id: "milo-lighter",
      duration: 2500,
    });

  const toggleAside = () => {
    if (ahead) setAsideAhead(stamp, block.id, !aside);
    else if (aside) undropBlock(block.id);
    else dropBlock(block.id);
    if (!aside) lighter();
  };

  const leaveNote = () => {
    const fresh = addNote({ blockId: block.id, showOn: ahead ? stamp : null });
    if (fresh) onOpenNote(fresh.id);
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center mt-5 gap-2">
        <button type="button" onClick={onPrev ?? undefined} disabled={!onPrev} aria-label="Previous block" className={STEP}>
          <ChevronLeft className="size-4" />
        </button>

        <span
          className="min-w-0 flex-1 truncate rounded-xl px-4 py-2 text-center text-base font-medium"
          style={{ backgroundColor: block.bg, color: block.ink }}
        >
          {name}
        </span>

        <button type="button" onClick={onNext ?? undefined} disabled={!onNext} aria-label="Next block" className={STEP}>
          <ChevronRight className="size-4" />
        </button>
      </div>

      {aside ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-foreground/4 px-4 py-6 text-center">
          <p className="text-sm text-foreground/60">
            {ahead
              ? "Set aside for tomorrow. It’s back the day after."
              : "Set aside for today. It’s back tomorrow."}
          </p>
          {canAside && (
            <button
              type="button"
              onClick={toggleAside}
              className="cursor-pointer rounded-lg bg-chip px-3 py-1.5 text-xs text-chip-ink hover:bg-chip/85"
            >
              Bring it back
            </button>
          )}
        </div>
      ) : (
        <>
          {mine.length === 0 ? (
            <p className="rounded-xl bg-foreground/4 px-4 py-6 text-center text-sm text-foreground/45">
              {ahead ? `Nothing waiting in ${name} on ${weekdayName(stamp)}.` : `Nothing in ${name} today.`}
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {mine.map((t) => (
                <TaskLine
                  key={t.id}
                  task={t}
                  ahead={ahead}
                  skipped={skipped.has(t.id)}
                  canPlan={canPlan}
                  onSkip={(skip) => {
                    skipTask(stamp, t.id, skip);
                    if (skip) lighter();
                  }}
                />
              ))}
            </ul>
          )}

          {canAside && (
            <button
              type="button"
              onClick={toggleAside}
              style={{ "--lift": "var(--card-lift)" }}
              className="milo-lift flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-foreground/10 bg-card text-sm text-foreground/75 transition-colors hover:text-foreground"
            >
              <Eraser className="size-4 opacity-60" />
              {ahead ? `Set ${name} aside tomorrow` : `Set ${name} aside today`}
            </button>
          )}
        </>
      )}

      <NoteLines
        title={`Notes in ${name}`}
        notes={waiting}
        onOpen={onOpenNote}
        onAdd={canWrite ? leaveNote : null}
        addLabel={`Leave a note in ${name}`}
      />
    </section>
  );
}
