"use client";

/* One block: its box on top, where a day column has its date — the block as it
   has always looked — then Add a task and the block's tasks for today. A drop
   target, as the day columns are. */

import { memo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { AddTask } from "../tasks-view/add-task";
import { CardMenu } from "../tasks-view/card-menu";
import { dropIndex } from "../tasks-view/day-column";
import { BlockTaskCard } from "./block-task-card";
import { BlockBox } from "./block-box";
import { BlockDraftCard } from "./draft-card";
import { HiddenTasks } from "./hidden-tasks";

export { dropIndex };

function DropLine() {
  return <div className="-my-[5px] h-0.5 shrink-0 rounded-full bg-(--theme-accent)" />;
}

// the drop target in its own thin wrapper, so drag moves redraw only this
function DropArea({ blockId, children }) {
  const { setNodeRef } = useDroppable({ id: blockId });
  return (
    <div
      ref={setNodeRef}
      data-drop={blockId}
      // the tasks scroll here, under the pinned header and Add a task; room after the last one
      className="scrollbar-none -mx-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1 pb-5 pt-1"
    >
      {children}
    </div>
  );
}

// hidden: the block's tasks that aren't today's, under the "Hidden tasks" button
export const BlockColumn = memo(function BlockColumn({ block, tasks, hidden, now, anyRunning, dragId, over, onAdd, onToggle, onNote, onDuplicate, onDelete, selected, selecting, onToggleSelect }) {
  const [drafting, setDrafting] = useState(false);
  // the card whose name is being fixed
  const [renaming, setRenaming] = useState(null);
  // a finished block folds away to its box and one line; open it to see what was done
  const [showDone, setShowDone] = useState(false);
  const finished = block.status === "done";

  if (finished && !showDone) {
    return (
      <section className="flex min-h-0 w-[18rem] shrink-0 flex-col gap-2.5">
        <BlockBox block={block} now={now} anyRunning={anyRunning} selected={selected} selecting={selecting} onToggleSelect={onToggleSelect} />
        <button
          type="button"
          onClick={() => setShowDone(true)}
          aria-expanded={false}
          className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-foreground/15 px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <Check className="size-4 text-[#00b86b]" strokeWidth={2.5} />
          <span className="flex-1 text-left">Done</span>
          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[11px] tabular-nums">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
          <ChevronDown className="size-4" />
        </button>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 w-[18rem] shrink-0 flex-col gap-2.5">
      {/* the block, as its box has always looked */}
      <BlockBox block={block} now={now} anyRunning={anyRunning} selected={selected} selecting={selecting} onToggleSelect={onToggleSelect} />
      {/* a finished block, opened: fold it back */}
      {finished && (
        <button
          type="button"
          onClick={() => setShowDone(false)}
          aria-expanded
          className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-foreground/15 px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <Check className="size-4 text-[#00b86b]" strokeWidth={2.5} />
          <span className="flex-1 text-left">Done</span>
          <ChevronDown className="size-4 rotate-180" />
        </button>
      )}

      <AddTask onStart={() => setDrafting(true)} />

      <DropArea blockId={block.id}>
        {drafting && (
          <BlockDraftCard
            onSave={(name, schedule) => {
              onAdd(block.id, name, null, schedule);
              setDrafting(false);
            }}
            onCancel={() => setDrafting(false)}
          />
        )}
        {tasks.map((task, i) => (
          <CardMenu key={task.id} onRename={() => setRenaming(task.id)} onDuplicate={() => onDuplicate(task)} onDelete={() => onDelete(task.id)}>
            <div data-task className="flex flex-col gap-2">
              {over === i && <DropLine />}
              <BlockTaskCard
                task={task}
                blockId={block.id}
                tint={block.bg}
                lifted={dragId === task.id}
                renaming={renaming === task.id}
                onRename={() => setRenaming(task.id)}
                onRenamed={() => setRenaming(null)}
                onToggle={() => onToggle(task)}
                onNote={onNote}
              />
            </div>
          </CardMenu>
        ))}
        {over === tasks.length && <DropLine />}

        {/* not today's: change a task's Days, or drag it up into today's list */}
        <HiddenTasks count={hidden.length}>
          {hidden.map((task) => (
            <CardMenu key={task.id} onRename={() => setRenaming(task.id)} onDuplicate={() => onDuplicate(task)} onDelete={() => onDelete(task.id)}>
              <div className="opacity-70 transition-opacity hover:opacity-100">
                <BlockTaskCard
                  task={task}
                  blockId={block.id}
                  tint={block.bg}
                  lifted={dragId === task.id}
                  renaming={renaming === task.id}
                  onRename={() => setRenaming(task.id)}
                  onRenamed={() => setRenaming(null)}
                  onToggle={() => onToggle(task)}
                  onNote={onNote}
                />
              </div>
            </CardMenu>
          ))}
        </HiddenTasks>
      </DropArea>
    </section>
  );
});
