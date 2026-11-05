"use client";

/* One task in a day, dressed as the Blocks board's cards but flat: a thin
   border and no lift — the lift sinks the card 4px on press, which made it jump
   under the pointer as a drag began. The round tick, the name, the time. Under the
   name sit its tools, shown on hover — Sunsama's card:

     0:00 pill   opens the time: play, Actual, Estimated
     note        opens a note on the card
     subtasks    opens its subtasks, with Add subtask
     repeat      makes it recurring
     move to     into a block, or onto a day from the calendar

   Click the card to keep its tools open; press and move it to drag it onto any
   day — a plain click never drags (dnd-kit waits for a few pixels). Drag pauses while
   anything on it is open, so typing in it never starts a drag. */

import { memo, useCallback, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { NotebookPen, Workflow } from "lucide-react";
import { clock } from "@/lib/duration";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/time";
import { Strike } from "../strike";
import { Tick } from "../task-bits";
import { NoteSection, StepCount, SubtasksSection, TimeSection } from "./card-sections";
import { RepeatMenu } from "./repeat-menu";
import { MoveMenu } from "./move-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tip } from "./tip";
import { NoteMark, Reveal } from "./reveal";
import { LabelChip, LabelMenu } from "./label-menu";

const CARD =
  "group/card flex flex-col rounded-lg border border-foreground/10 bg-card px-3 py-2.5 focus-within:border-[#2f80ed]/40 group-data-[menu-open]/menu:border-[#2f80ed]/40 has-[[data-popup-open]]:border-[#2f80ed]/40";

// the Today blue on hover, the same blue a tool keeps once it holds something
const TOOL = "cursor-pointer transition-colors hover:text-[#2f80ed]";

// the time on a task so far, counting the clock if it's running
export function spentMs(task, now) {
  return (task.actualMs ?? 0) + (task.startedAt && now ? now - task.startedAt : 0);
}

export function TimePill({ ms = 0, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "shrink-0 cursor-pointer rounded-md px-1.5 py-0.5 text-[11px] tabular-nums transition-colors",
        active ? "bg-foreground/60 text-background" : "bg-muted text-muted-foreground hover:text-[#2f80ed]",
      )}
    >
      {clock(ms)}
    </button>
  );
}

function Tools({ task, origin, open, toggle, onPatch, onMove, always = false }) {
  const steps = task.steps ?? [];
  return (
    <TooltipProvider delay={300}>
    {/* eases open on hover, the accordion's way; kept open while one of its menus is
        (hiding it then took the menu's anchor away and the menu jumped to the corner) */}
    <Reveal show={always || open.any || open.pinned}>
    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2.5 text-xs text-muted-foreground">
      {/* a repeat's copy shares its task's label but can't change it there */}
      {origin ? <LabelMenu value={task.categoryId ?? null} onChange={(categoryId) => onPatch({ categoryId })} /> : <LabelChip categoryId={task.categoryId} />}
      <Tip label={task.note ? "Note" : "Add a note"}>
        <button type="button" aria-label="Note" onClick={() => toggle("note")} className={cn(TOOL, (open.note || task.note) && "text-[#2f80ed]")}>
          <NotebookPen className="size-3.5" />
        </button>
      </Tip>
      <Tip label={steps.length ? "Subtasks" : "Add subtasks"}>
        <button
          type="button"
          aria-label="Subtasks"
          onClick={() => toggle("subtasks")}
          className={cn(TOOL, (open.subtasks || steps.length > 0) && "text-[#2f80ed]")}
        >
          <Workflow className="size-3.5" />
        </button>
      </Tip>
      {origin && <RepeatMenu origin={origin} value={task.repeat} onChange={(repeat) => onPatch({ repeat })} />}
      {origin && onMove && <MoveMenu origin={origin} onMoveToBlock={onMove.toBlock} onMoveToDay={onMove.toDay} />}
      {/* how far through its subtasks, at the end of the row */}
      <StepCount steps={steps} />
    </div>
    </Reveal>
    </TooltipProvider>
  );
}

// dragFrom: the day it can be dragged from; without one (a repeat's copy) it doesn't drag
/* Two layers, for speed. The drag library redraws every draggable on every
   pointer move; this outer one takes those redraws and is nearly free. The card
   itself (CardBody) is memoised, so it only redraws when the task changes. */
// onMove: { toBlock(blockId), toDay(date) }; a repeat's copy has none
export function TaskCard({ task, origin, dragFrom, lifted = false, onToggle, onPatch, onMove }) {
  const [open, setOpen] = useState(OPEN_NONE);
  const any = open.time || open.note || open.subtasks;
  const toggle = useCallback((part) => setOpen((o) => ({ ...o, [part]: !o[part] })), []);

  const { setNodeRef, attributes, listeners } = useDraggable({
    id: task.id,
    data: { from: dragFrom },
    disabled: !dragFrom || any,
  });

  return (
    <CardBody
      nodeRef={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      task={task}
      origin={origin}
      lifted={lifted}
      open={open}
      toggle={toggle}
      onToggle={onToggle}
      onPatch={onPatch}
      onMove={onMove}
    />
  );
}

// pinned: clicked open, so its tools stay showing without hovering
const OPEN_NONE = { time: false, note: false, subtasks: false, pinned: false };

const CardBody = memo(function CardBody({ nodeRef, attributes, listeners, task, origin, lifted, open, toggle, onToggle, onPatch, onMove }) {
  const any = open.time || open.note || open.subtasks;
  const running = Boolean(task.startedAt);
  const now = useNow(running, 1000);
  const ms = spentMs(task, now);
  const steps = task.steps ?? [];

  const play = () =>
    onPatch(running ? { actualMs: spentMs(task, Date.now()), startedAt: null } : { startedAt: Date.now() });

  return (
    <div
      ref={nodeRef}
      data-task-card
      {...attributes}
      {...listeners}
      // a click pins its tools open (and unpins them); there's no sheet any more
      onClick={() => toggle("pinned")}
      // a pointer, not a hand: the grab hand only shows while it's carried. Faded where it was meanwhile
      className={cn(CARD, "cursor-pointer select-none outline-none", lifted && "opacity-40")}
    >
      <div className="flex items-start gap-2.5">
        <Tick done={task.done} onToggle={onToggle} className="mt-0.5 size-4" />
        <span className={cn("min-w-0 flex-1 break-words text-sm", task.done && "text-foreground/40")}>
          <Strike id={task.id} done={task.done} className="align-top">{task.title}</Strike>
        </span>
        {/* it has a note: said on the card itself, so you don't have to hover to know */}
        <NoteMark count={task.note?.trim() ? 1 : 0} />
        {/* its label, so you can see it without hovering */}
        <LabelChip categoryId={task.categoryId} />
        <TooltipProvider delay={300}>
          <Tip label={running ? "Time · the clock is running" : "Time: track it, or estimate it"}>
            <TimePill ms={ms} active={open.time || running} onClick={() => toggle("time")} />
          </Tip>
        </TooltipProvider>
      </div>

      <Tools task={task} origin={origin} open={{ ...open, any }} toggle={toggle} onPatch={onPatch} onMove={onMove} />

      {/* open parts, and the subtasks, which stay on the card whenever it has some */}
      {(any || steps.length > 0) && (
        <div onClick={(e) => e.stopPropagation()} className="flex cursor-default flex-col gap-2 pt-2">
          {open.time && (
            <TimeSection
              actualMinutes={ms / 60000}
              running={running}
              minutes={task.minutes}
              onPlay={play}
              onActual={(m) => onPatch({ actualMs: m * 60000, startedAt: running ? Date.now() : null })}
              onEstimate={(m) => onPatch({ minutes: m })}
            />
          )}
          {(open.subtasks || steps.length > 0) && (
            <SubtasksSection
              steps={steps}
              adding={open.subtasks}
              onChange={(next) => onPatch({ steps: next })}
              onDone={() => toggle("subtasks")}
            />
          )}
          {open.note && <NoteSection note={task.note} onChange={(note) => onPatch({ note })} />}
        </div>
      )}
    </div>
  );
});

// a card being written: the name is a field, and the tools are always showing
export function DraftCard({ onSave, onCancel }) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-2.5">
        <input
          autoFocus
          aria-label="Task name"
          placeholder="Task name"
          onBlur={(e) => (e.target.value.trim() ? onSave(e.target.value.trim()) : onCancel())}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
            if (e.key === "Enter" && e.currentTarget.value.trim()) onSave(e.currentTarget.value.trim());
          }}
          className="min-w-0 flex-1 rounded-sm border border-dashed border-[#a855f7] bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        <TimePill />
      </div>
      <div className="flex items-center gap-2.5 pt-2 text-xs text-muted-foreground">
        <span>Select label</span>
        <NotebookPen className="size-3.5" />
        <Workflow className="size-3.5" />
      </div>
    </div>
  );
}
