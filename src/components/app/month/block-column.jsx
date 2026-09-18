"use client";

// One block as a column: its colour and name, which weekdays it's busy, every task in it, and a field to add more.
// Tasks dropped here from another column move into this block.

import { shade } from "@/lib/shade";
import { TaskPlanRow } from "../task-plan-row";
import { AddTaskForm } from "./add-task-form";
import { BlockMenu } from "./block-menu";
import { BusyWeek } from "./busy-week";

export const TASK_DRAG = "application/milo-task";

export function BlockColumn({ block, tasks, activeId, onOpen, drag, over, onOver, onLeave, onDrop }) {
  return (
    <section
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(TASK_DRAG)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onOver();
      }}
      onDragLeave={(e) => {
        // moving between the rows inside still counts as over the column
        if (!e.currentTarget.contains(e.relatedTarget)) onLeave();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(e.dataTransfer.getData(TASK_DRAG));
      }}
      style={over ? { boxShadow: `inset 0 0 0 2px ${block.bg}` } : undefined}
      className="flex w-80 shrink-0 flex-col gap-3 rounded-2xl bg-foreground/4 p-3 transition-shadow"
    >
      <header
        className="milo-lift flex flex-col gap-3 rounded-xl px-4 pt-3 pb-3"
        style={{ backgroundColor: block.bg, color: block.ink, "--lift": shade(block.bg, 0.22) }}
      >
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-medium">{block.name.replace(" Block", "")}</span>
            <span className="text-xs opacity-60">
              {tasks.length === 0 ? "Nothing in it yet" : `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`}
            </span>
          </div>
          <BlockMenu block={block} />
        </div>
        <BusyWeek tasks={tasks} />
      </header>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {/* where the carried task will land */}
        {over && (
          <li
            className="flex h-12 items-center justify-center rounded-xl border-2 border-dashed text-xs text-foreground/45"
            style={{ borderColor: block.bg }}
          >
            Drop to move here
          </li>
        )}
        {tasks.length === 0 && !over && (
          <li className="py-4 text-center text-xs text-foreground/35">Add its first task below.</li>
        )}
        {tasks.map((t) => (
          <TaskPlanRow
            key={t.id}
            task={t}
            active={activeId === t.id}
            onOpen={onOpen}
            drag={{ onStart: drag.onStart, onEnd: drag.onEnd, lifted: drag.id === t.id }}
          />
        ))}
      </ul>

      <AddTaskForm block={block} />
    </section>
  );
}
