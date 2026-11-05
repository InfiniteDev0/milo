"use client";

/* One day: its name and date, a badge for a special day, Add a task, then the
   day's tasks. Any task can be dropped in here, between any two; a blue line
   shows where it will land — above the card you're over if you're on its top
   half, below it if you're on its bottom half. The dragging itself is dnd-kit,
   run from index.jsx. */

import { memo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { specialDays } from "@/lib/special-days";
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
  return <div className="-my-[5px] h-0.5 shrink-0 rounded-full bg-[#2f80ed]" />;
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
export const DayColumn = memo(function DayColumn({ dayKey, date, isToday, tasks, repeats, loading, dragId, over, onAdd, onToggle, onPatch, onDuplicate, onDelete, onMoveToBlock, onMoveToDay }) {
  const special = specialDays(date);
  // how many it holds that are done, a repeat's copy included; it only ever counts up
  const doneCount = tasks.filter((t) => t.done).length + repeats.filter((r) => r.task.done).length;
  const [drafting, setDrafting] = useState(false);

  return (
    <section data-today={isToday || undefined} data-tour={isToday ? "today" : undefined} className="flex min-h-0 w-[18rem] shrink-0 flex-col gap-2">
      <header className="flex h-10 items-center gap-2">
        <h2 className="text-lg font-semibold">
          {date.toLocaleDateString([], WEEKDAY)}{" "}
          <span className="text-muted-foreground">{date.toLocaleDateString([], MONTHDAY)}</span>
        </h2>
        {isToday && <span className="text-xs font-semibold text-[#2f80ed]">Today</span>}
        {/* the far end: the day's badges, then how many it holds that are done (where Focus used to sit) */}
        <span className="ml-auto flex min-w-0 items-center gap-1.5">
          {special.map((name) => (
            <span key={name} className="truncate rounded-sm bg-[#0b8043] px-2 py-0.5 text-xs font-semibold text-white">
              {name}
            </span>
          ))}
          {doneCount > 0 && (
            <span title="Tasks done on this day" className="shrink-0 rounded-sm bg-[#00b86b]/15 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-[#00a35f] dark:text-[#3ddc97]">
              {doneCount} done
            </span>
          )}
        </span>
      </header>

      <AddTask onStart={() => setDrafting(true)} />

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
          // right-click for Duplicate and Delete
          <CardMenu
            key={task.id}
            onDuplicate={() => onDuplicate(dayKey, task.id)}
            onDelete={() => onDelete(dayKey, task.id)}
          >
          <div data-task className="flex flex-col gap-2">
            {over === i && <DropLine />}
            <TaskCard
              task={task}
              origin={date}
              dragFrom={dayKey}
              lifted={dragId === task.id}
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
        {repeats.map((r) => (
          <TaskCard key={r.id} task={r.task} origin={r.origin} onToggle={r.toggle} onPatch={r.patch} />
        ))}
      </DropArea>
    </section>
  );
});
