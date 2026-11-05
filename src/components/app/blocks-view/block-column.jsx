"use client";

/* One block: its box on top, where a day column has its date — the block as it
   has always looked — then Add a task and the block's tasks for today. A drop
   target, as the day columns are. */

import { memo, useState } from "react";
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
  return <div className="-my-[5px] h-0.5 shrink-0 rounded-full bg-[#2f80ed]" />;
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
export const BlockColumn = memo(function BlockColumn({ block, tasks, hidden, now, anyRunning, dragId, over, onAdd, onToggle, onNote, onDuplicate, onDelete }) {
  const [drafting, setDrafting] = useState(false);

  return (
    <section className="flex min-h-0 w-[18rem] shrink-0 flex-col gap-2.5">
      {/* the block, as its box has always looked */}
      <BlockBox block={block} now={now} anyRunning={anyRunning} />

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
          <CardMenu key={task.id} onDuplicate={() => onDuplicate(task)} onDelete={() => onDelete(task.id)}>
            <div data-task className="flex flex-col gap-2">
              {over === i && <DropLine />}
              <BlockTaskCard
                task={task}
                blockId={block.id}
                tint={block.bg}
                lifted={dragId === task.id}
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
            <CardMenu key={task.id} onDuplicate={() => onDuplicate(task)} onDelete={() => onDelete(task.id)}>
              <div className="opacity-70 transition-opacity hover:opacity-100">
                <BlockTaskCard
                  task={task}
                  blockId={block.id}
                  tint={block.bg}
                  lifted={dragId === task.id}
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
