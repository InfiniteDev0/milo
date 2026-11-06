"use client";

/* A block's task, dressed as the Tasks view's cards — flat, the round tick, the
   name, its step count and its time — with a border in its block's colour, so a
   column reads as one block from its box down.

   Hovered, it shows the same tools as a day's card, wired to the block task:

     days        which weekdays it shows up, and whether it comes back
     time pill   its estimate (how long you think it'll take)
     notes N     at the far end: the task's notes, in the notes sheet
     subtasks    its steps, with Add subtask
     move to     into another block

   Click it to keep its tools open (there's no task sheet any more); ▶ puts it
   In Progress. Press and move to drag it within its block or onto another. Drag pauses while anything
   on it is open. Same two-layer split as the Tasks view's card, so dragging
   stays quick. */

import { memo, useCallback, useState } from "react";
import { Pause, Play, Workflow } from "lucide-react";
import { toast } from "sonner";
import { createDayTask } from "@/lib/db/day-tasks";
import { dayName, showDayToast } from "../tasks-view/day-toasts";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useBlocks } from "../blocks-provider";
import { Strike } from "../strike";
import { Tick } from "../task-bits";
import { StepCount, SubtasksSection } from "../tasks-view/card-sections";
import { InlineName } from "../tasks-view/inline-name";
import { MoveMenu } from "../tasks-view/move-menu";
import { minutesLabel } from "@/lib/duration";
import { TimePicker } from "../tasks-view/time-picker";
import { Tip } from "../tasks-view/tip";
import { DaysMenu } from "./days-menu";
import { Reveal } from "../tasks-view/reveal";
import { useTaskNoteCount } from "../task-note-count";

const CARD =
  "group/card flex flex-col rounded-lg border border-foreground/10 bg-card px-3 py-2.5 group-data-[menu-open]/menu:border-[#2f80ed]/40";
const TOOL = "cursor-pointer transition-colors hover:text-[#2f80ed]";
// pinned: clicked open, so its tools stay showing without hovering
const OPEN_NONE = { subtasks: false, pinned: false };

// renaming: its name is a box; onRename asks to start (double-click), onRenamed says it ended
export function BlockTaskCard({ task, blockId, tint, lifted, renaming = false, onRename, onRenamed, onToggle, onNote }) {
  const [open, setOpen] = useState(OPEN_NONE);
  const toggle = useCallback((part) => setOpen((o) => ({ ...o, [part]: !o[part] })), []);
  const any = open.subtasks;
  const { setNodeRef, attributes, listeners } = useDraggable({ id: task.id, data: { from: blockId }, disabled: any });

  return (
    <Body
      nodeRef={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      task={task}
      blockId={blockId}
      tint={tint}
      lifted={lifted}
      renaming={renaming}
      onRename={onRename}
      onRenamed={onRenamed}
      open={open}
      toggle={toggle}
      onToggle={onToggle}
      onNote={onNote}
    />
  );
}

const Body = memo(function Body({ nodeRef, attributes, listeners, task, blockId, tint, lifted, renaming, onRename, onRenamed, open, toggle, onToggle, onNote }) {
  const { setTaskMinutes, setTaskStatus, addStep, toggleStep, renameStep, removeStep, renameTask, moveTask, blocks: allBlocks, start, takeOutTask } = useBlocks();
  // to a day: a day task with its subtasks and note, and out of the block (kept on record, like a finished once-task)
  const toDay = async (day) => {
    const { error } = await createDayTask(day, { title: task.name, minutes: task.minutes ?? null, steps: task.steps ?? [], note: task.note ?? "" });
    if (error) return toast("Couldn't move it just now. It's still here.");
    takeOutTask(task.id);
    showDayToast({ title: "Moved to", day: dayName(day), hint: "It's a day task now, subtasks and all." });
  };
  const doing = task.status === "doing";
  const done = task.status === "done";
  const steps = task.steps ?? [];
  const any = open.subtasks;
  // its note on the card, and any notes written about it in the notes tray
  const notes = useTaskNoteCount(task.id) + (task.note?.trim() ? 1 : 0);

  // the subtasks section hands back the whole new list; the blocks keep steps one change at a time
  const changeSteps = (next) => {
    const before = new Map(steps.map((s) => [s.id, s]));
    const after = new Map(next.map((s) => [s.id, s]));
    for (const s of steps) if (!after.has(s.id)) removeStep(task.id, s.id);
    for (const s of next) {
      const was = before.get(s.id);
      if (!was) addStep(task.id, s.name);
      else if (was.done !== s.done) toggleStep(task.id, s.id);
      else if (was.name !== s.name) renameStep(task.id, s.id, s.name);
    }
  };

  return (
    <div
      ref={nodeRef}
      data-task-card
      {...attributes}
      {...listeners}
      // a click pins its tools open (and unpins them); there's no sheet any more
      onClick={() => toggle("pinned")}
      // the block's colour as the border only; the card itself stays the plain card colour.
      // On a light page the full colour, deepened a little — pale yellows and cyans vanish on white
      style={tint ? { "--tint": tint } : undefined}
      className={cn(
        CARD,
        tint &&
          "border-[1.5px] border-[color-mix(in_srgb,var(--tint)_78%,black)] dark:border dark:border-[color-mix(in_srgb,var(--tint)_70%,transparent)]",
        "cursor-pointer select-none outline-none",
        lifted && "opacity-40",
      )}
    >
      <TooltipProvider delay={300}>
        <div className="flex items-start gap-2.5">
          <Tick done={done} onToggle={onToggle} className="mt-0.5 size-4" />
          <InlineName
            value={task.name}
            editing={renaming}
            onEdit={onRename}
            onSave={(name) => renameTask(task.id, name)}
            onStop={onRenamed}
            className={cn("min-w-0 flex-1 [overflow-wrap:anywhere] text-sm", done && "text-foreground/40")}
            inputClassName="min-w-0 flex-1 text-sm"
          >
            <Strike id={task.id} done={done} className="align-top">{task.name}</Strike>
          </InlineName>
          {/* In Progress, from the card: ▶ puts it in progress (inside a running block, that
              starts its clock and what the "time's up" alert counts); ❚❚ puts it back to To Do */}
          {!done && (
            <Tip label={doing ? "Back to To Do" : "Start this task"}>
              <button
                type="button"
                aria-label={doing ? `Stop ${task.name}` : `Start ${task.name}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  // starting a task in a block that isn't running starts the block too, so its clock really moves
                  if (!doing && allBlocks.find((b) => b.id === blockId)?.status !== "ongoing") start(blockId);
                  setTaskStatus(task.id, doing ? "todo" : "doing");
                }}
                className={cn(
                  "flex size-[22px] shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors",
                  doing ? "bg-[#2f80ed] text-white" : "text-muted-foreground hover:bg-foreground/10 hover:text-[#2f80ed]",
                )}
              >
                {doing ? <Pause className="size-3" fill="currentColor" /> : <Play className="size-3" fill="currentColor" />}
              </button>
            </Tip>
          )}
          {/* the estimate: press to choose one — not once it's done, when it's only a label */}
          {done ? (
            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground/70">
              {task.minutes ? minutesLabel(task.minutes) : "0:00"}
            </span>
          ) : (
          <span onClick={(e) => e.stopPropagation()} className="shrink-0">
            <TimePicker
              onPick={(m) => setTaskMinutes(task.id, m)}
              trigger={
                <button
                  type="button"
                  className="cursor-pointer rounded-md bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground transition-colors hover:text-[#2f80ed]"
                >
                  {task.minutes ? minutesLabel(task.minutes) : "0:00"}
                </button>
              }
            />
          </span>
          )}
        </div>

        {/* the tools ease open on hover, the accordion's way; kept while one is open or its menu is */}
        <Reveal show={any || open.pinned}>
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2.5 text-xs text-muted-foreground">
          {/* which weekdays it shows up, and whether it comes back */}
          <DaysMenu task={task} />
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
          <MoveMenu fromBlock={blockId} onMoveToBlock={(to) => moveTask(task.id, to)} onMoveToDay={toDay} />
          {/* the far end: its notes (opens the notes sheet), then how far through its subtasks */}
          <span className="ms-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNote(task)}
              className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-[#2f80ed]"
            >
              Notes
              <span className="rounded-sm bg-white px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-black dark:bg-black dark:text-white">
                {notes}
              </span>
            </button>
            <StepCount steps={steps} />
          </span>
        </div>
        </Reveal>
      </TooltipProvider>

      {/* open parts, and the subtasks, which stay on the card whenever it has some */}
      {(any || steps.length > 0) && (
        <div onClick={(e) => e.stopPropagation()} className="flex cursor-default flex-col gap-2 pt-2">
          {(open.subtasks || steps.length > 0) && (
            <SubtasksSection steps={steps} adding={open.subtasks} onChange={changeSteps} onDone={() => toggle("subtasks")} />
          )}
        </div>
      )}
    </div>
  );
});
