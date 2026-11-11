"use client";

/* One day: its name and date, a badge for a special day, Add a task, then the
   day's tasks. Any task can be dropped in here, between any two; a blue line
   shows where it will land — above the card you're over if you're on its top
   half, below it if you're on its bottom half. The dragging itself is dnd-kit,
   run from index.jsx. */

import { memo, useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { specialDays } from "@/lib/special-days";
import { cn } from "@/lib/utils";
import { clearDraft, onDraft, peekDraft } from "@/lib/day-draft";
import { AddTask } from "./add-task";
import { DraftCard, TaskCard } from "./task-card";
import { CardMenu } from "./card-menu";

const WEEKDAY = { weekday: "short" };
const MONTHDAY = { month: "short", day: "numeric" };

// where among the cards a drop at this height lands
export function dropIndex(list, y) {
  const cards = [...list.querySelectorAll("[data-task]")];
  const i = cards.findIndex((c) => {
    const r = c.getBoundingClientRect();
    return y < r.top + r.height / 2;
  });
  return i === -1 ? cards.length : i;
}

// sits in the 8px gap between cards, so showing it never shifts them
function DropLine() {
  return <div className="-my-[5px] h-0.5 shrink-0 rounded-full bg-(--theme-accent)" />;
}

// repeats: the recurring tasks that come round on this day, each with its own open/toggle/patch
// The drop target. Its own small component: the drag library redraws whatever
// listens to it on every pointer move, and the cards inside come in as children,
// which React passes through untouched — so only this thin wrapper redraws.
function DropArea({ dayKey, children }) {
  const { setNodeRef } = useDroppable({ id: dayKey });
  return (
    <div
      ref={setNodeRef}
      data-drop={dayKey}
      // the tasks scroll here, under the pinned header and Add a task; room after the last one
      className="scrollbar-none -mx-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1 pb-5 pt-1"
    >
      {children}
    </div>
  );
}

// over: where a dragged task would land in this day (an index), or null.
// memo: during a drag only the day under the pointer changes, so only it redraws
// loading: the saved tasks haven't arrived yet, so the day shows placeholders rather than looking empty
// dimLabel: a label picked in the bar — tasks without it fade (not hide, so dragging stays true)
export const DayColumn = memo(function DayColumn({ dayKey, date, isToday, tasks, repeats, dimLabel, loading, dragId, over, onAdd, onToggle, onPatch, onDuplicate, onDelete, onMoveToBlock, onMoveToDay }) {
  const special = specialDays(date);
  // how many it holds that are done, a repeat's copy included; it only ever counts up
  const doneCount = tasks.filter((t) => t.done).length + repeats.filter((r) => r.task.done).length;
  // how many it holds in all; shown on its own, never as "1 of 3"
  const total = tasks.length + repeats.length;
  // "New task" from the phone's + opens today's draft, whether this column was up yet or not
  const [drafting, setDrafting] = useState(() => isToday && peekDraft());
  useEffect(() => {
    if (!isToday) return;
    clearDraft();
    return onDraft(() => {
      clearDraft();
      setDrafting(true);
    });
  }, [isToday]);
  // the card whose name is being fixed
  const [renaming, setRenaming] = useState(null);

  return (
    <section data-today={isToday || undefined} data-tour={isToday ? "today" : undefined} className="flex min-h-0 w-[var(--day-col,18rem)] shrink-0 snap-start flex-col gap-2">
      <header className="flex h-10 items-center gap-2">
        <h2 className="text-lg font-semibold">
          {/* today says so by its weekday in the theme colour, no word beside it */}
          <span className={isToday ? "text-(--theme-accent)" : undefined}>{date.toLocaleDateString([], WEEKDAY)}</span>{" "}
          <span className="text-muted-foreground">{date.toLocaleDateString([], MONTHDAY)}</span>
        </h2>
        {/* the far end: the day's badges, how many it holds, then how many are done (where Focus used to sit) */}
        <span className="ml-auto flex min-w-0 items-center gap-1.5">
          {special.map((name) => (
            <span key={name} className="truncate rounded-sm bg-[#0b8043] px-2 py-0.5 text-xs font-semibold text-white">
              {name}
            </span>
          ))}
          {total > 0 && (
            <span title="Tasks on this day" className="shrink-0 rounded-sm bg-foreground/[0.08] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-foreground/70">
              {total} {total === 1 ? "task" : "tasks"}
            </span>
          )}
          {doneCount > 0 && (
            <span title="Tasks done on this day" className="shrink-0 rounded-sm bg-[#00b86b]/15 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-[#00a35f] dark:text-[#3ddc97]">
              {doneCount} done
            </span>
          )}
        </span>
      </header>

      <div data-tour="add-task">
        <AddTask onStart={() => setDrafting(true)} />
      </div>

      {/* the drop area runs to the bottom of the day, so a drop below the last card still lands */}
      <DropArea dayKey={dayKey}>
        {drafting && (
          <DraftCard
            onSave={(title) => {
              onAdd(dayKey, title);
              setDrafting(false);
            }}
            onCancel={() => setDrafting(false)}
          />
        )}
        {loading && (
          <>
            <span aria-hidden className="h-16 shrink-0 animate-pulse rounded-lg bg-foreground/5" />
            <span aria-hidden className="h-16 shrink-0 animate-pulse rounded-lg bg-foreground/5" />
          </>
        )}
        {tasks.map((task, i) => (
          // right-click for Rename, Duplicate and Delete
          <CardMenu
            key={task.id}
            onRename={() => setRenaming(task.id)}
            onDuplicate={() => onDuplicate(dayKey, task.id)}
            onDelete={() => onDelete(dayKey, task.id)}
          >
          <div data-task className={cn("flex flex-col gap-2", dimLabel && task.categoryId !== dimLabel && "opacity-30")}>
            {over === i && <DropLine />}
            <TaskCard
              task={task}
              origin={date}
              dragFrom={dayKey}
              lifted={dragId === task.id}
              renaming={renaming === task.id}
              onRename={() => setRenaming(task.id)}
              onRenamed={() => setRenaming(null)}
              onToggle={() => onToggle(dayKey, task.id)}
              onPatch={(patch) => onPatch(dayKey, task.id, patch)}
              onMove={{
                toBlock: (blockId) => onMoveToBlock(dayKey, task.id, blockId),
                toDay: (day) => onMoveToDay(dayKey, task.id, day),
              }}
            />
          </div>
          </CardMenu>
        ))}
        {over === tasks.length && <DropLine />}
        {/* recurring tasks from an earlier day; ticking one ticks it for this day only */}
        {/* right-click one: Delete takes it off this day only; Duplicate makes a one-off copy here */}
        {repeats.map((r) => (
          <CardMenu key={r.id} onDuplicate={r.copy} onDelete={r.skip}>
            <div data-task className={cn("flex flex-col gap-2", dimLabel && r.task.categoryId !== dimLabel && "opacity-30")}>
              <TaskCard task={r.task} origin={r.origin} onToggle={r.toggle} onPatch={r.patch} />
            </div>
          </CardMenu>
        ))}
      </DropArea>
    </section>
  );
});
