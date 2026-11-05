"use client";

/* The Blocks view: the bar naming the day, then a column for each block with
   today's tasks under it — the Tasks view's layout, with blocks where the days
   are. Each column is topped by the block's own box; open it to start the block. Drag a task within a block to reorder it,
   or onto another block to move it there. Click a task for its sheet. */

import { useEffect, useMemo, useRef, useState } from "react";
import { useNow } from "@/lib/time";
import { onDay, todayId } from "@/lib/days";
import { DndContext, DragOverlay, PointerSensor, pointerWithin, rectIntersection, useSensor, useSensors } from "@dnd-kit/core";
import { useBlocks } from "../blocks-provider";
import { BlocksHeader } from "../blocks-header";
import { LongScrollbar } from "../tasks-view/long-scrollbar";
import { BlockColumn, dropIndex } from "./block-column";
import { BoardArea } from "./board-area";
import { BoardFailed, BoardSkeleton } from "./board-states";
import { NoteSheet, openingNote } from "./note-sheet";
import { useNotes } from "../notes-provider";

const NONE = [];

export function BlocksView() {
  const { blocks: allBlocks, hydrated, loadFailed, retry, focusLocked, ongoing, startAndLead, tasks, isToday, addTask, removeTask, moveTask, reorderTasks, setTaskStatus, setTaskDays, skipTask, todayStamp } =
    useBlocks();
  // locked in: only the running block shows, the rest wait off screen
  const blocks = focusLocked && ongoing ? allBlocks.filter((b) => b.id === ongoing.id) : allBlocks;
  // a running block counts its time on its box
  const anyRunning = blocks.some((b) => b.status === "ongoing");
  const now = useNow(anyRunning);
  const rowRef = useRef(null);
  // the task whose notes sheet is open, the note it opened on, and a count that makes each opening fresh
  const { notes, addNote } = useNotes();
  const [noteFor, setNoteFor] = useState(null);
  const openNotes = (task) => setNoteFor((n) => ({ id: task.id, noteId: openingNote(task, notes, addNote), n: (n?.n ?? 0) + 1 }));

  // each block's tasks for today, in the block's own order — and the ones that aren't today's
  const [byBlock, hiddenBy] = useMemo(() => {
    const today = {};
    const hidden = {};
    for (const t of tasks) ((isToday(t) ? today : hidden)[t.blockId] ??= []).push(t);
    return [today, hidden];
  }, [tasks, isToday]);

  // a hidden task made part of today: back from being set aside, and today added to its days
  const makeToday = (task) => {
    if (onDay(task)) skipTask(todayStamp, task.id, false);
    else setTaskDays(task.id, [...(task.days ?? []), todayId()]);
  };

  // the latest of everything the drag handlers read, so they can be made once
  // a hidden task moved to another block, waiting for the move to land before it's made today's
  const pendingToday = useRef(null);
  useEffect(() => {
    const id = pendingToday.current;
    if (!id) return;
    pendingToday.current = null;
    const task = tasks.find((t) => t.id === id);
    if (task && !isToday(task)) makeToday(task);
  });

  const latest = useRef({ tasks, byBlock, moveTask, reorderTasks, makeToday, startAndLead });
  useEffect(() => {
    latest.current = { tasks, byBlock, moveTask, reorderTasks, makeToday, startAndLead };
  });

  const [drag, setDrag] = useState(null);
  const [landing, setLanding] = useState(null);
  const dragRef = useRef(null);
  const landingRef = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const dnd = useMemo(() => {
    const land = (next) => {
      const l = landingRef.current;
      if (l === next || (l && next && l.key === next.key && l.index === next.index)) return;
      landingRef.current = next;
      setLanding(next);
    };
    const endDrag = () => {
      dragRef.current = null;
      landingRef.current = null;
      setDrag(null);
      setLanding(null);
      document.body.style.cursor = "";
    };
    // drop at `index` among `to`'s tasks for today: moved into the block first if it
    // came from another, then the block's whole order rewritten with it in place
    const drop = (from, id, to, index) => {
      const { tasks: all, byBlock: today, moveTask: move, reorderTasks: reorder, makeToday: bringIn } = latest.current;
      // a hidden task dropped among today's becomes part of today. Into its own block
      // straight away; into another, once the move has landed (both rebuild the same list)
      const task = all.find((t) => t.id === id);
      if (task && !(today[from] ?? NONE).some((t) => t.id === id)) {
        if (from === to) bringIn(task);
        else pendingToday.current = id;
      }
      const visible = (today[to] ?? NONE).filter((t) => t.id !== id);
      const anchor = visible[index]?.id ?? null;
      const rest = all.filter((t) => t.blockId === to && t.id !== id).map((t) => t.id);
      const at = anchor ? rest.indexOf(anchor) : rest.length;
      const order = [...rest.slice(0, at), id, ...rest.slice(at)];
      if (from !== to) move(id, to);
      reorder(to, order);
    };
    return {
      autoScroll: { threshold: { x: 0.12, y: 0.15 }, acceleration: 6 },
      // a task lands on a block's column; the board as a whole is only for a carried block
      collisionDetection: (args) => {
        const forTask = args.active.data.current?.type !== "block";
        const keep = (hits) => (forTask ? hits.filter((h) => h.id !== "board") : hits);
        const hits = keep(pointerWithin(args));
        return hits.length ? hits : keep(rectIntersection(args));
      },
      onDragStart: ({ active, activatorEvent }) => {
        // a block's box, carried to be started: no lines, just the box under the pointer
        if (active.data.current?.type === "block") {
          const rect = activatorEvent.target.closest("[data-block-box]")?.getBoundingClientRect();
          const b = active.data.current.block;
          const d = { type: "block", id: active.id, block: b, width: rect?.width ?? 288, height: rect?.height ?? 64 };
          dragRef.current = d;
          setDrag(d);
          document.body.style.cursor = "grabbing";
          return;
        }
        const rect = activatorEvent.target.closest("[data-task-card]")?.getBoundingClientRect();
        const d = { from: active.data.current.from, id: active.id, width: rect?.width ?? 288, height: rect?.height ?? 48 };
        dragRef.current = d;
        setDrag(d);
        document.body.style.cursor = "grabbing";
      },
      onDragMove: ({ over, activatorEvent, delta }) => {
        const d = dragRef.current;
        if (!d) return;
        // a block over the board: it will lead and start when let go
        if (d.type === "block") return land(over ? { key: "board", index: 0 } : null);
        const list = over && rowRef.current?.querySelector(`[data-drop="${over.id}"]`);
        if (!list) return land(null);
        const index = dropIndex(list, activatorEvent.clientY + delta.y);
        // right above or below itself in its own block it would stay put: no line
        if (over.id === d.from) {
          const at = (latest.current.byBlock[d.from] ?? NONE).findIndex((t) => t.id === d.id);
          if (index === at || index === at + 1) return land(null);
        }
        land({ key: over.id, index });
      },
      onDragEnd: () => {
        const d = dragRef.current;
        const l = landingRef.current;
        if (d?.type === "block") {
          // dropped anywhere on the board: first in line, and running — and the row
          // glides back to the front, where it now is (once it has been redrawn there)
          if (l) {
            latest.current.startAndLead(d.block.id);
            requestAnimationFrame(() => rowRef.current?.scrollTo({ left: 0, behavior: "smooth" }));
          }
        } else if (d && l) drop(d.from, d.id, l.key, l.index);
        endDrag();
      },
      onDragCancel: endDrag,
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <BlocksHeader />

      <DndContext sensors={sensors} {...dnd}>
        <BoardArea
          rowRef={rowRef}
          // a block carried over it: the board brightens to say "let go to start"
          active={drag?.type === "block" && landing?.key === "board"}
        >
          {/* still loading: skeleton columns. Failed: say so, never "no blocks". Only a
              settled, empty read says there are none */}
          {loadFailed ? (
            <BoardFailed onRetry={retry} />
          ) : !hydrated ? (
            <BoardSkeleton />
          ) : (
            blocks.length === 0 && (
              <p className="py-6 text-sm text-muted-foreground">No blocks yet. Add them in Settings › Blocks.</p>
            )
          )}
          {hydrated && !loadFailed && blocks.map((b) => (
            <BlockColumn
              key={b.id}
              block={b}
              tasks={byBlock[b.id] ?? NONE}
              hidden={hiddenBy[b.id] ?? NONE}
              dragId={drag?.id ?? null}
              over={landing?.key === b.id ? landing.index : null}
              now={now}
              anyRunning={anyRunning}
              onAdd={addTask}
              onToggle={(t) => setTaskStatus(t.id, t.status === "done" ? "todo" : "done")}
              onNote={openNotes}
              onDuplicate={(t) => addTask(b.id, t.name, t.minutes ?? null)}
              onDelete={removeTask}
            />
          ))}
        </BoardArea>
        <DragOverlay dropAnimation={null}>
          {drag?.type === "block" ? (
            // the block itself under the pointer, as the old lineup carried it
            <div
              style={{ width: drag.width, height: drag.height, background: drag.block.bg, color: drag.block.ink }}
              className="flex cursor-grabbing items-center rounded-xl px-4 text-sm font-medium shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
            >
              {drag.block.name.replace(" Block", "")}
            </div>
          ) : drag ? (
            <div
              style={{ width: drag.width, height: drag.height }}
              className="cursor-grabbing rounded-lg border-2 border-dashed border-foreground/25 bg-foreground/5"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      <LongScrollbar targetRef={rowRef} />

      {/* a task's notes, from the note icon on its card */}
      <NoteSheet
        key={noteFor?.n ?? 0}
        task={noteFor ? (tasks.find((t) => t.id === noteFor.id) ?? null) : null}
        initialNoteId={noteFor?.noteId ?? null}
        onClose={() => setNoteFor(null)}
      />
    </div>
  );
}
