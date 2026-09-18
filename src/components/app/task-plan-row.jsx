"use client";

// One task as you plan it: its name, the days it lands on, and where it lives. Opens on click; can be dragged.

import { FolderInput } from "lucide-react";
import { useBlocks } from "./blocks-provider";
import { DeleteTaskButton } from "./delete-task-button";
import { MoveTaskMenu } from "./move-task-menu";
import { TaskNoteCount, useTaskNoteCount } from "./task-note-count";
import { DayPicker } from "./task-sheet/day-picker";

// the row opens its task on click; these controls keep their clicks to themselves
const keep = (e) => e.stopPropagation();

// `drag` is { onStart, onEnd, lifted } where rows can be carried to another block
export function TaskPlanRow({ task, active, onOpen, drag }) {
  const { setTaskDays, isToday } = useBlocks();
  const noteCount = useTaskNoteCount(task.id);
  const days = task.days ?? [];

  return (
    <li
      onClick={() => onOpen(task.id)}
      draggable={Boolean(drag)}
      onDragStart={drag ? (e) => drag.onStart(e, task) : undefined}
      onDragEnd={drag?.onEnd}
      // while carried, its place in the list is a dotted outline
      className={`group flex cursor-pointer flex-col gap-2.5 rounded-xl border px-3 py-3 transition-colors ${
        drag?.lifted
          ? "border-dashed border-foreground/25 *:invisible"
          : `bg-card ${active ? "border-[#5e17eb]/40" : "border-foreground/10"}`
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1 break-words text-sm">{task.name}</span>

        {/* on today or not, said quietly — a task on other days is not missing */}
        <span className="shrink-0 pt-0.5 text-[11px] text-foreground/40">
          {isToday(task) ? "Today" : days.length === 0 ? "Any day" : "Other days"}
        </span>

        <TaskNoteCount count={noteCount} className="pt-0.5" />

        <MoveTaskMenu
          task={task}
          trigger={
            <button
              type="button"
              onClick={keep}
              aria-label={`Move ${task.name} to another block`}
              title="Move to another block"
              className="-my-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-foreground/35 transition hover:bg-foreground/5 hover:text-foreground"
            >
              <FolderInput className="size-3.5" />
            </button>
          }
        />
        <DeleteTaskButton task={task} className="-my-1 -mr-1.5" />
      </div>

      <div onClick={keep} className="flex flex-wrap items-center gap-2">
        <DayPicker compact days={days} onChange={(next) => setTaskDays(task.id, next)} />
        {task.kind === "once" && <span className="text-[11px] text-foreground/40">Just once</span>}
      </div>
    </li>
  );
}
