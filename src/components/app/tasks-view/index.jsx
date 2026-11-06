"use client";

/* The Tasks view: a row of days, a column each — Today and ‹ › above, Add a
   task at the top of every day. This year and next, 1 January to 31 December of the year after; it
   opens on today, and you scroll back as freely as forward.

   Only the days on screen (and a few either side) are drawn. A year of columns
   drawn at once is what made it slow; the row keeps its full width, so the
   scrollbar still spans the year.

   Drag a task onto any day. From a day that has gone, it COPIES — the old day
   keeps it, as it happened, and the copy carries everything over. From today
   or a day to come, it moves. Within a day, it reorders.

   A recurring task lives on the day it was written and shows again on every
   day its rule lands on after that. Ticking it there ticks that day only
   (doneOn); everything else — name, subtasks, note, time — is the one task.

   Saved in day_tasks (migration 0014), not in tasks: a block task belongs to a
   block and never to a date, and a day task's day is only the column it sits
   in — never a due date, never late. use-day-tasks.js loads them and saves
   every change this view makes; the view itself just changes its state. */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { repeatsOn } from "@/lib/repeat";
import { playTask, playTuck } from "@/lib/sound";
import { showUndoToast } from "../undo-toast";
import { useBlocks } from "../blocks-provider";
import { DayColumn, dropIndex } from "./day-column";
import { LongScrollbar } from "./long-scrollbar";
import { useDayTasks } from "./use-day-tasks";
import { dayName, showDayToast } from "./day-toasts";
import { RunningTimer } from "./running-timer";
import { LabelFilter } from "./label-menu";
import { markStep } from "../whats-new/steps";
import { TooltipProvider } from "@/components/ui/tooltip";
import { celebrateTask } from "../celebrate";
import { showMovedToast } from "../moved-toast";
import { useCategories } from "../categories-provider";
import { onJumpToDay, takePendingDay } from "@/lib/jump-to-day";
import { onDayTaskAdds, takeDayTaskAdds } from "@/lib/day-task-inbox";
import { ViewHeader } from "../view-header";

// a column is 18rem with a 1.5rem gap after it
const COLUMN_REM = 18;
const GAP_REM = 1.5;
// days drawn past each edge of the screen, so a quick scroll — or a drag carrying
// a task across days — finds them already there instead of drawing them one by one
const SPARE = 10;

const keyOf = (d) => d.toDateString();
// the time now, read when something happens (never while drawing)
const nowMs = () => Date.now();
// one empty list for every empty day, so an untouched day never looks changed
const NONE = [];

// every day of the year that today is in
// 1 January of this year to 31 December of next, so December can already plan January
function daysOfYear(today) {
  const year = new Date(today).getFullYear();
  const days = [];
  for (let d = new Date(year, 0, 1); d.getFullYear() <= year + 1; d.setDate(d.getDate() + 1)) days.push(new Date(d));
  return days;
}

const rootPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

// the dates are the browser's, so the server renders none rather than guess
const subscribe = () => () => {};
const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const onServer = () => null;


export function TasksView() {
  const start = useSyncExternalStore(subscribe, today, onServer);
  const { tasks, setTasks, hydrated, loadFailed, canWrite, hold, release } = useDayTasks();
  // a label picked in the bar: tasks without it fade
  const [labelFilter, setLabelFilter] = useState(null);
  const rowRef = useRef(null);

  // made once a day, not on every render: a fresh Date would make every column redraw
  const days = useMemo(() => (start == null ? [] : daysOfYear(start)), [start]);
  const todayIndex = useMemo(() => days.findIndex((d) => d.getTime() === start), [days, start]);

  // which days are drawn: [first, last]
  const [range, setRange] = useState([0, -1]);
  const stepPx = useCallback(() => (COLUMN_REM + GAP_REM) * rootPx(), []);

  const measure = useCallback(() => {
    const row = rowRef.current;
    if (!row || !days.length) return;
    const step = stepPx();
    const first = Math.max(0, Math.floor(row.scrollLeft / step) - SPARE);
    const last = Math.min(days.length - 1, Math.ceil((row.scrollLeft + row.clientWidth) / step) + SPARE);
    setRange((r) => (r[0] === first && r[1] === last ? r : [first, last]));
  }, [days.length, stepPx]);

  const scrollToIndex = useCallback(
    (i, behavior) => rowRef.current?.scrollTo({ left: Math.max(0, i) * stepPx(), behavior }),
    [stepPx],
  );

  // the top bar's date wheel: glide to the day it settles on
  useEffect(
    () =>
      onJumpToDay((date) => {
        // handled here, so it isn't kept for a later visit
        takePendingDay();
        const i = days.findIndex((d) => d.toDateString() === date.toDateString());
        if (i >= 0) scrollToIndex(i, "smooth");
      }),
    [days, scrollToIndex],
  );

  // opens on today, not on 1 January — before paint, so January never flashes
  useLayoutEffect(() => {
    if (todayIndex < 0) return;
    // or on the day the search opened this view for
    const asked = takePendingDay();
    const at = asked ? days.findIndex((d) => d.toDateString() === asked.toDateString()) : -1;
    scrollToIndex(at >= 0 ? at : todayIndex, "instant");
    measure();
  }, [todayIndex, days, scrollToIndex, measure]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    row.addEventListener("scroll", onScroll, { passive: true });
    const sizes = new ResizeObserver(measure);
    sizes.observe(row);
    return () => {
      cancelAnimationFrame(frame);
      row.removeEventListener("scroll", onScroll);
      sizes.disconnect();
    };
  }, [measure]);


  // the tasks as they are now, for a delete, a tick or a move to read
  const latest = useRef(tasks);
  useEffect(() => {
    latest.current = tasks;
  }, [tasks]);

  // the same functions every render, so a day only redraws when its own tasks change
  const add = useCallback(
    (key, title) => {
      // nothing is added before the saved tasks are here: it would have nowhere safe to go
      if (!canWrite) return;
      setTasks((all) => ({ ...all, [key]: [{ id: crypto.randomUUID(), title, done: false }, ...(all[key] ?? [])] }));
      showDayToast({ title: "Added to", day: dayName(key), hint: title });
      markStep("add-day-task");
    },
    [canWrite, setTasks],
  );

  // a label whose category was deleted comes off (the database has already let it go), so a
  // later save never names a category that isn't there
  const categories = useCategories();
  useEffect(() => {
    if (!categories.hydrated || categories.loadFailed) return;
    const known = new Set(categories.list.map((c) => c.id));
    const stale = (t) => t.categoryId && !known.has(t.categoryId);
    if (!Object.values(latest.current).some((list) => list.some(stale))) return;
    setTasks((all) => Object.fromEntries(Object.entries(all).map(([k, list]) => [k, list.map((t) => (stale(t) ? { ...t, categoryId: null } : t))])));
  }, [categories.hydrated, categories.loadFailed, categories.list, setTasks]);

  // tasks the search added to a day: taken in once the saved ones are here, so they save like any other
  useEffect(() => {
    if (!canWrite) return;
    const takeIn = () => takeDayTaskAdds().forEach(({ date, title }) => add(keyOf(date), title));
    takeIn();
    return onDayTaskAdds(takeIn);
  }, [canWrite, add]);

  // ticked done: the sound, and on today the Blocks view's own celebration ("You showed up for 3 things
  // today"); on another day "today" wouldn't be true, so just the sound. Unticking says nothing
  const toggle = useCallback(
    (key, id) => {
      const list = latest.current[key] ?? NONE;
      const task = list.find((t) => t.id === id);
      // its clock so far; ticking it done stops the clock and keeps that time
      const spent = task ? (task.actualMs ?? 0) + (task.startedAt ? nowMs() - task.startedAt : 0) : 0;
      setTasks((all) => ({
        ...all,
        [key]: all[key].map((t) => (t.id !== id ? t : t.done ? { ...t, done: false } : { ...t, done: true, actualMs: spent, startedAt: null })),
      }));
      if (!task || task.done) return;
      playTask();
      if (new Date(key).getTime() === start) {
        celebrateTask({ task: { ...task, minutes: task.minutes ?? 0 }, block: null, doneToday: list.filter((t) => t.done).length + 1, blockComplete: false, run: 0, spentMs: spent });
      }
    },
    [setTasks, start],
  );
  const update = useCallback(
    (key, id, patch) => {
      // one clock at a time: starting this one banks and stops any other that's running
      const at = nowMs();
      setTasks((all) => {
        const next = { ...all, [key]: all[key].map((t) => (t.id === id ? { ...t, ...patch } : t)) };
        if (!patch.startedAt) return next;
        return Object.fromEntries(
          Object.entries(next).map(([k, list]) => [
            k,
            list.map((t) => (t.id !== id && t.startedAt ? { ...t, actualMs: (t.actualMs ?? 0) + Math.max(0, at - t.startedAt), startedAt: null } : t)),
          ]),
        );
      });
      // the What's new steps these count for
      if (patch.startedAt) markStep("start-timer");
      if (patch.minutes) markStep("set-estimate");
      if (patch.categoryId) markStep("label-task");
    },
    [setTasks],
  );
  // as the Blocks view deletes: gone at once, with a few seconds to bring it back
  const remove = useCallback((key, id) => {
    const list = latest.current[key] ?? [];
    const index = list.findIndex((t) => t.id === id);
    if (index < 0) return;
    const task = list[index];
    // held, so leaving the day doesn't delete it before Undo has had its few seconds
    hold(id);
    setTasks((all) => ({ ...all, [key]: (all[key] ?? []).filter((t) => t.id !== id) }));
    playTuck();
    showUndoToast({
      title: `Deleted “${task.title}”`,
      hint: "You can still bring it back.",
      onCommit: () => release(id, true),
      onUndo: () => {
        // back where it was, into the day as it is now
        setTasks((all) => {
          const now = all[key] ?? [];
          if (now.some((t) => t.id === id)) return all;
          return { ...all, [key]: [...now.slice(0, index), task, ...now.slice(index)] };
        });
        release(id, false);
        playTask();
      },
    });
  }, [hold, release, setTasks]);
  // a copy right under the original, with everything on it
  const duplicate = useCallback(
    (key, id) => {
      setTasks((all) => {
        const list = all[key] ?? [];
        const at = list.findIndex((t) => t.id === id);
        if (at < 0) return all;
        const t = list[at];
        const copy = { ...t, id: crypto.randomUUID(), steps: (t.steps ?? []).map((s) => ({ ...s, id: crypto.randomUUID() })), startedAt: null };
        return { ...all, [key]: [...list.slice(0, at + 1), copy, ...list.slice(at + 1)] };
      });
      showDayToast({ title: "Duplicated", hint: "The copy sits right under it, with everything on it." });
    },
    [setTasks],
  );

  // the task being dragged (its day, and the card's size for the dashed box), and where it would land
  const [drag, setDrag] = useState(null);
  const [landing, setLanding] = useState(null);
  // the same two, read by the handlers: refs never go stale, so a move that
  // arrives after the drop can't bring the line back
  const dragRef = useRef(null);
  const landingRef = useRef(null);
  const land = (next) => {
    const l = landingRef.current;
    if (l === next || (l && next && l.key === next.key && l.index === next.index)) return;
    landingRef.current = next;
    setLanding(next);
  };
  // a press only becomes a drag after a few pixels, so a click still opens the sheet
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const drop = (from, id, to, index) => {
    // another day: said once it lands. A reorder within a day says nothing — a toast per drag is noise
    const moving = from !== to && (latest.current[from] ?? NONE).some((t) => t.id === id);
    setTasks((all) => {
      const source = all[from] ?? [];
      const task = source.find((t) => t.id === id);
      if (!task) return all;
      const past = new Date(from).getTime() < start;
      if (from === to) {
        // a reorder: the gap it leaves shifts everything after it up one
        const rest = source.filter((t) => t.id !== id);
        const at = index > source.indexOf(task) ? index - 1 : index;
        return { ...all, [to]: [...rest.slice(0, at), task, ...rest.slice(at)] };
      }
      const landed = past ? { ...task, id: crypto.randomUUID() } : task;
      const target = [...(all[to] ?? [])];
      target.splice(index, 0, landed);
      return past ? { ...all, [to]: target } : { ...all, [from]: source.filter((t) => t.id !== id), [to]: target };
    });
    if (!moving) return;
    if (new Date(from).getTime() < start) showDayToast({ title: "Copied to", day: dayName(to), hint: "The old day keeps it, as it happened.", mood: "content" });
    else showDayToast({ title: "Moved to", day: dayName(to), hint: "Same task, new day." });
  };
  // Move to a block: it becomes that block's task (saved, in the Blocks view) and leaves the day
  const { addTask, blocks } = useBlocks();
  const moveToBlock = useCallback(
    (key, id, blockId) => {
      const task = (latest.current[key] ?? NONE).find((t) => t.id === id);
      if (!task) return;
      // its subtasks and note come with it (a block task has no label or repeat to take)
      addTask(blockId, task.title, task.minutes ?? null, { steps: task.steps ?? [], note: task.note ?? "" });
      setTasks((all) => ({ ...all, [key]: (all[key] ?? []).filter((t) => t.id !== id) }));
      const block = blocks.find((b) => b.id === blockId);
      // the Blocks view's own toast for a task changing home
      if (block) showMovedToast({ count: 1, to: block, noun: "task" });
    },
    [addTask, blocks, setTasks],
  );

  const dropRef = useRef(drop);
  useEffect(() => {
    dropRef.current = drop;
  });

  // Move to a day: as a drop at the top of that day, so a past day copies and any other moves
  const moveToDay = useCallback((key, id, day) => dropRef.current(key, id, keyOf(day), 0), []);

  // made once: a new set of handlers every render would make every card redraw on every move
  const dnd = useMemo(() => {
    const endDrag = () => {
      dragRef.current = null;
      landingRef.current = null;
      setDrag(null);
      setLanding(null);
      document.body.style.cursor = "";
    };
    return {
      // carrying a task to the edge glides the row along, gently, rather than lurching
      autoScroll: { threshold: { x: 0.12, y: 0.15 }, acceleration: 6 },
      // the day under the pointer, not under the box
      collisionDetection: (args) => {
        const hits = pointerWithin(args);
        return hits.length ? hits : rectIntersection(args);
      },
      onDragStart: ({ active, activatorEvent }) => {
        // measured off the card itself: dnd-kit hasn't measured it yet when this runs
        const rect = activatorEvent.target.closest("[data-task-card]")?.getBoundingClientRect();
        const d = { from: active.data.current.from, id: active.id, width: rect?.width ?? 288, height: rect?.height ?? 72 };
        dragRef.current = d;
        setDrag(d);
        // the grab hand, only while carrying
        document.body.style.cursor = "grabbing";
      },
      onDragMove: ({ over, activatorEvent, delta }) => {
        const d = dragRef.current;
        if (!d) return;
        const list = over && rowRef.current?.querySelector(`[data-drop="${over.id}"]`);
        if (!list) return land(null);
        const index = dropIndex(list, activatorEvent.clientY + delta.y);
        // right above or right below itself in its own day it would stay where it is:
        // no line, and letting go just puts it back. A day of one task never shows one
        if (over.id === d.from) {
          const at = (latest.current[d.from] ?? NONE).findIndex((t) => t.id === d.id);
          if (index === at || index === at + 1) return land(null);
        }
        land({ key: over.id, index });
      },
      onDragEnd: () => {
        const d = dragRef.current;
        const l = landingRef.current;
        if (d && l) dropRef.current(d.from, d.id, l.key, l.index);
        endDrag();
      },
      onDragCancel: endDrag,
    };
  }, []);

  // each day's recurring copies, worked out only when the tasks change — never during a drag
  const repeats = useMemo(() => {
    const recurring = Object.entries(tasks).flatMap(([key, list]) =>
      list.filter((t) => t.repeat && t.repeat !== "none").map((t) => ({ key, origin: new Date(key), task: t })),
    );
    const byDay = {};
    if (!recurring.length) return byDay;
    for (const day of days) {
      const dayKey = keyOf(day);
      // a day it was removed from (doneOn: "skip") doesn't show it
      const here = recurring.filter((r) => repeatsOn(r.task.repeat, r.origin, day, r.task.repeatRule) && (r.task.doneOn ?? {})[dayKey] !== "skip");
      if (!here.length) continue;
      byDay[dayKey] = here.map((r) => {
        const doneOn = r.task.doneOn ?? {};
        return {
          id: `${r.task.id}@${dayKey}`,
          origin: r.origin,
          task: { ...r.task, id: `${r.task.id}@${dayKey}`, done: doneOn[dayKey] === true },
          toggle: () => update(r.key, r.task.id, { doneOn: { ...doneOn, [dayKey]: doneOn[dayKey] !== true } }),
          patch: (p) => update(r.key, r.task.id, p),
          // just this day: gone from it (the rest of the repeat stays), with a few seconds to bring it back
          skip: () => {
            const was = doneOn[dayKey];
            update(r.key, r.task.id, { doneOn: { ...doneOn, [dayKey]: "skip" } });
            playTuck();
            showUndoToast({
              title: `Removed “${r.task.title}” from this day`,
              hint: "It still repeats on the other days.",
              onCommit: () => {},
              onUndo: () => {
                const next = { ...doneOn };
                if (was === undefined) delete next[dayKey];
                else next[dayKey] = was;
                update(r.key, r.task.id, { doneOn: next });
                playTask();
              },
            });
          },
          // a one-off copy on this day, with everything on it
          copy: () => add(dayKey, r.task.title),
        };
      });
    }
    return byDay;
  }, [tasks, days, update, add]);

  const scroll = (by) => {
    const row = rowRef.current;
    if (row) scrollToIndex(Math.round(row.scrollLeft / stepPx()) + by, "smooth");
  };

  const [first, last] = range;
  const shown = days.slice(first, last + 1);

  return (
    <div className="flex h-full flex-col">
      <ViewHeader
        onToday={() => scrollToIndex(todayIndex, "smooth")}
        onPrev={() => scroll(-1)}
        onNext={() => scroll(1)}
      >
        {/* fade every task without this label */}
        <LabelFilter value={labelFilter} onChange={setLabelFilter} />
      </ViewHeader>

      {/* a failed read knows nothing about your days, so it never shows them as empty */}
      {loadFailed && (
        <p className="shrink-0 border-b border-border px-5 py-2 text-sm text-muted-foreground">
          Couldn&rsquo;t reach your tasks. Nothing you added is gone.
        </p>
      )}

      <DndContext sensors={sensors} {...dnd}>
        <div
          ref={rowRef}
          // its own scrollbar is hidden: the long one below drives it
          // sideways only: each day scrolls its own tasks, under its pinned header
          className="scrollbar-none min-h-0 flex-1 overflow-x-auto overflow-y-hidden bg-muted/30 px-4 pt-2"
        >
          {/* the whole year's width; the days before the drawn ones are padding */}
          <div
            className="flex h-full gap-6"
            style={{
              width: `${days.length * (COLUMN_REM + GAP_REM) - GAP_REM}rem`,
              paddingLeft: `${first * (COLUMN_REM + GAP_REM)}rem`,
            }}
          >
            {shown.map((d) => (
              <DayColumn
                key={keyOf(d)}
                date={d}
                isToday={d.getTime() === start}
                tasks={tasks[keyOf(d)] ?? NONE}
                repeats={repeats[keyOf(d)] ?? NONE}
                loading={!hydrated}
                dimLabel={labelFilter}
                onAdd={add}
                onToggle={toggle}
                onPatch={update}
                onDuplicate={duplicate}
                onDelete={remove}
                onMoveToBlock={moveToBlock}
                onMoveToDay={moveToDay}
                dayKey={keyOf(d)}
                dragId={drag?.id ?? null}
                over={landing?.key === keyOf(d) ? landing.index : null}
              />
            ))}
          </div>
        </div>
        {/* what follows the pointer: a dashed box the card's size, as the Blocks board drags */}
        <DragOverlay dropAnimation={null}>
          {drag && (
            <div
              style={{ width: drag.width, height: drag.height }}
              className="cursor-grabbing rounded-lg border-2 border-dashed border-foreground/25 bg-foreground/5"
            />
          )}
        </DragOverlay>
      </DndContext>
      <LongScrollbar targetRef={rowRef} />
      {/* the clock that's running, at the bottom right */}
      <TooltipProvider delay={300}>
        <RunningTimer tasks={tasks} onPatch={update} onDone={toggle} />
      </TooltipProvider>
    </div>
  );
}
