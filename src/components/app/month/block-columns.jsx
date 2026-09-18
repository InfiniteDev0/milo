"use client";

// The month's blocks side by side, each with every task in it. Drag a task onto another column to move it there,
// open one to see it in full, or add a block at the end.

import { useState } from "react";
import { Plus } from "lucide-react";
import { IconInput } from "@/components/ui/icon-input";
import { useBlocks } from "../blocks-provider";
import { DragFollower, dragStart, hideDragImage } from "../drag-follower";
import { TaskSheet } from "../task-sheet";
import { BlockColumn, TASK_DRAG } from "./block-column";
import { TaskDragCard } from "./task-drag-card";

function ColumnsSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 overflow-hidden pb-3">
      {[3, 1, 2, 0].map((rows, i) => (
        <div key={i} className="flex w-80 shrink-0 flex-col gap-3 rounded-2xl bg-foreground/4 p-3">
          <span className="h-24 rounded-xl bg-foreground/8" />
          {Array.from({ length: rows }, (_, r) => (
            <span key={r} className="h-20 rounded-xl bg-foreground/6" />
          ))}
          <span className="h-10 rounded-[10px] bg-foreground/6" />
        </div>
      ))}
    </div>
  );
}

export function BlockColumns() {
  const { blocks, droppedToday, tasks, moveTask, addBlock, hydrated } = useBlocks();
  const [openTask, setOpenTask] = useState(null);
  // the task being carried and where the pointer caught it, and the column under it
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const [blockDraft, setBlockDraft] = useState("");

  if (!hydrated) return <ColumnsSkeleton />;

  // blocks set aside today are still part of the month
  const columns = [...blocks, ...droppedToday];

  const endDrag = () => {
    setDrag(null);
    setOver(null);
  };

  const carry = {
    id: drag?.task.id ?? null,
    onStart: (e, task) => {
      e.dataTransfer.setData(TASK_DRAG, task.id);
      e.dataTransfer.effectAllowed = "move";
      hideDragImage(e);
      setDrag({ ...dragStart(e), task });
    },
    onEnd: endDrag,
  };

  return (
    <>
      <div className="scrollbar-pill flex items-start gap-4 overflow-x-auto pb-3">
        {columns.map((b) => (
          <BlockColumn
            key={b.id}
            block={b}
            tasks={tasks.filter((t) => t.blockId === b.id)}
            activeId={openTask}
            onOpen={setOpenTask}
            drag={carry}
            // a column only offers a slot for a task that isn't already in it
            over={over === b.id && drag != null && drag.task.blockId !== b.id}
            onOver={() => setOver(b.id)}
            onLeave={() => setOver((o) => (o === b.id ? null : o))}
            onDrop={(id) => {
              endDrag();
              if (id) moveTask(id, b.id);
            }}
          />
        ))}

        {/* a block thought of mid-month doesn't have to wait for the month to turn */}
        <form
          className="flex w-72 shrink-0 flex-col gap-2 rounded-2xl border border-dashed border-foreground/15 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            addBlock(blockDraft);
            setBlockDraft("");
          }}
        >
          <span className="px-1 text-xs text-foreground/45">New block</span>
          <IconInput
            value={blockDraft}
            onChange={(e) => setBlockDraft(e.target.value)}
            placeholder="Add a block to this month…"
            aria-label="Add a block"
            icon={<Plus className="size-4" />}
          />
        </form>
      </div>

      <DragFollower start={drag} onEnd={endDrag}>
        {drag && <TaskDragCard task={drag.task} />}
      </DragFollower>

      <TaskSheet taskId={openTask} onClose={() => setOpenTask(null)} />
    </>
  );
}
