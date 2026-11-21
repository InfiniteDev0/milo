"use client";

// The board's Task view, as the app's day columns, and its dragging as the app's (tasks-view/index.jsx): a press
// becomes a drag after 6px, a dashed box the card's size follows the pointer, a blue line shows where it will land,
// and the day under the pointer takes a soft fill. Within a day it reorders; onto another day it moves (or copies,
// from a day that has gone). Above it, as the app: Today, then ‹ › gliding the row a day at a time; the row scrolls
// freely too, a week back and four weeks on.

import { useLayoutEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CirclePlus } from "lucide-react";
import { FIRST_DAY, LAST_DAY, dayAt } from "./board-data";
import { BoardHeader } from "./board-header";
import { BLUE, DayTask } from "./day-task";

const DAYS = Array.from({ length: LAST_DAY - FIRST_DAY + 1 }, (_, i) => FIRST_DAY + i);
const TODAY_AT = -FIRST_DAY;

// where among the cards a drop at this height lands
function dropIndex(list, y) {
  const cards = [...list.querySelectorAll("[data-task]")];
  const i = cards.findIndex((c) => {
    const r = c.getBoundingClientRect();
    return y < r.top + r.height / 2;
  });
  return i === -1 ? cards.length : i;
}

// sits in the gap between cards, so showing it never shifts them
function DropLine() {
  return <div className="-my-[5px] h-0.5 shrink-0 rounded-full" style={{ background: BLUE }} />;
}

function Day({ n, tasks, dragId, line }) {
  const { setNodeRef, isOver } = useDroppable({ id: n });
  const date = dayAt(n);
  const done = tasks.filter((t) => t.done).length;
  return (
    <div data-day className={`-m-1.5 flex w-[15rem] shrink-0 flex-col gap-2 rounded-md p-1.5 ${dragId && isOver ? "bg-(--b-fill)" : ""}`}>
      <div className="flex h-9 items-center gap-1.5">
        <span className="text-[15px] font-semibold!" style={n === 0 ? { color: BLUE } : undefined}>
          {date.toLocaleDateString("en-US", { weekday: "long" })}
        </span>
        <span className="text-[15px] text-(--b-ink3)">{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        <span className="ml-auto flex items-center gap-1.5">
          {/* as the app: no count on an empty day */}
          {tasks.length > 0 && (
            <span className="rounded-[4px] bg-(--b-fill2) px-1.5 py-0.5 text-[11px] text-(--b-ink2) tabular-nums">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </span>
          )}
          {done > 0 && (
            <span className="rounded-[4px] bg-[#00b86b]/15 px-1.5 py-0.5 text-[11px] text-[#00a35f] tabular-nums">{done} done</span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-(--b-fill2) bg-(--b-card) px-3 py-2.5 text-[13px] text-(--b-ink2)">
        <CirclePlus className="size-3.5" />
        Add a task
      </div>
      {/* the drop target: the whole rest of the column */}
      <div ref={setNodeRef} data-drop={n} className="flex flex-1 flex-col gap-2">
        {tasks.map((t, i) => (
          <div key={t.id} data-task className="flex flex-col gap-2">
            {line === i && <DropLine />}
            <DayTask {...t} lifted={dragId === t.id} />
          </div>
        ))}
        {line === tasks.length && <DropLine />}
      </div>
    </div>
  );
}

// tasks and onDrop come from the board, so they stay put across views
export function DayColumns({ tasks, onDrop }) {
  const [drag, setDrag] = useState(null);
  const [landing, setLanding] = useState(null);
  const dragRef = useRef(null);
  const landingRef = useRef(null);
  const rowRef = useRef(null);
  // one day's width, column to column, measured off the row itself
  const step = () => {
    const [a, b] = rowRef.current?.querySelectorAll("[data-day]") ?? [];
    return a && b ? b.offsetLeft - a.offsetLeft : 0;
  };
  const scrollToIndex = (i, behavior) => rowRef.current?.scrollTo({ left: Math.max(0, i) * step(), behavior });
  const scroll = (by) => {
    const row = rowRef.current;
    if (row && step()) scrollToIndex(Math.round(row.scrollLeft / step()) + by, "smooth");
  };
  // opens on today, before paint, so the week before never flashes
  useLayoutEffect(() => {
    rowRef.current?.scrollTo({ left: TODAY_AT * step(), behavior: "instant" });
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const land = (next) => {
    const l = landingRef.current;
    if (l === next || (l && next && l.key === next.key && l.index === next.index)) return;
    landingRef.current = next;
    setLanding(next);
  };
  const end = () => {
    dragRef.current = null;
    landingRef.current = null;
    setDrag(null);
    setLanding(null);
    document.body.style.cursor = "";
  };

  return (
    <>
      <BoardHeader
        start={
          <button
            type="button"
            onClick={() => scrollToIndex(TODAY_AT, "smooth")}
            className="cursor-pointer rounded-md bg-(--b-fill) px-3 py-1.5 text-[13px] hover:bg-(--b-fill2)"
          >
            Today
          </button>
        }
        onPrev={() => scroll(-1)}
        onNext={() => scroll(1)}
      />
      <DndContext
        sensors={sensors}
        // the day under the pointer, not under the box
        collisionDetection={(args) => {
          const hits = pointerWithin(args);
          return hits.length ? hits : rectIntersection(args);
        }}
        onDragStart={({ active, activatorEvent }) => {
          const rect = activatorEvent.target.closest("[data-task-card]")?.getBoundingClientRect();
          const d = {
            from: active.data.current.from,
            id: active.id,
            width: rect?.width ?? 240,
            height: rect?.height ?? 72,
          };
          dragRef.current = d;
          setDrag(d);
          document.body.style.cursor = "grabbing";
        }}
        onDragMove={({ over, activatorEvent, delta }) => {
          const d = dragRef.current;
          if (!d) return;
          const list = over && rowRef.current?.querySelector(`[data-drop="${over.id}"]`);
          if (!list) return land(null);
          const index = dropIndex(list, activatorEvent.clientY + delta.y);
          // right above or below itself in its own day it would stay put: no line
          if (over.id === d.from) {
            const at = tasks.filter((t) => t.day === d.from).findIndex((t) => t.id === d.id);
            if (index === at || index === at + 1) return land(null);
          }
          land({ key: over.id, index });
        }}
        onDragEnd={() => {
          const d = dragRef.current;
          const l = landingRef.current;
          if (d && l) onDrop(d.from, d.id, l.key, l.index);
          end();
        }}
        onDragCancel={end}
      >
        {/* the row: scrolls sideways, the arrows glide it */}
        <div ref={rowRef} className="scrollbar-none flex h-[32rem] gap-6 overflow-x-auto overflow-y-hidden px-4 pt-2.5">
          {DAYS.map((n) => (
            <Day
              key={n}
              n={n}
              tasks={tasks.filter((t) => t.day === n)}
              dragId={drag?.id ?? null}
              line={landing?.key === n ? landing.index : null}
            />
          ))}
        </div>
        {/* what follows the pointer: a dashed box the card's size, as the app drags */}
        <DragOverlay dropAnimation={null}>
          {drag && (
            <div
              style={{ width: drag.width, height: drag.height }}
              className="cursor-grabbing rounded-md border-2 border-dashed border-(--b-line) bg-(--b-fill)"
            />
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
}
