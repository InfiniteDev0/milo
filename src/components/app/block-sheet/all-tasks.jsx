"use client";

// Every task in a block, whatever day it's on: change its days, move it to another block, or delete it.

import { useBlocks } from "../blocks-provider";
import { TaskPlanRow } from "../task-plan-row";

export function AllTasks({ block, activeId, onOpen }) {
  const { tasks } = useBlocks();
  const mine = tasks.filter((t) => t.blockId === block.id);

  if (mine.length === 0) {
    return <p className="py-8 text-center text-sm text-foreground/35">No tasks in this block yet.</p>;
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {mine.map((t) => (
        <TaskPlanRow key={t.id} task={t} active={activeId === t.id} onOpen={onOpen} />
      ))}
    </ul>
  );
}
