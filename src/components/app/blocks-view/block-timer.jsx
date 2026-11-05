"use client";

/* The Blocks view's floating timer: the same box as the Tasks view's
   (FloatingTimer), fed by a block task that's In Progress. Its time is what the
   interval log has on it (TIME.md), which only moves while its block runs.

     Pause    back to To Do; the timer stays, dimmed, to pick it up again
     Resume   In Progress again, starting its block first if it isn't running,
              so the clock really moves
     Done     ticks it, with the usual celebration (and "under your estimate")
     Stop     back to To Do, and the timer goes */

import { useState } from "react";
import { useBlocks } from "../blocks-provider";
import { FloatingTimer } from "../tasks-view/running-timer";

export function BlockTimer() {
  const { tasks, blocks, runningTaskId, spentOnTask, setTaskStatus, start } = useBlocks();
  // the one paused from here, kept showing until it's resumed, stopped or done
  const [paused, setPaused] = useState(null);

  // the one whose clock is moving, else any In Progress, else the one paused here
  const task =
    tasks.find((t) => t.id === runningTaskId) ??
    tasks.find((t) => t.status === "doing") ??
    (paused ? tasks.find((t) => t.id === paused && t.status !== "done") : null);
  if (!task) return null;

  const block = blocks.find((b) => b.id === task.blockId);
  const running = runningTaskId === task.id;

  return (
    <FloatingTimer
      title={task.name}
      running={running}
      spent={(now) => spentOnTask(task.id, now ?? undefined)}
      onPause={() => {
        setTaskStatus(task.id, "todo");
        setPaused(task.id);
      }}
      onResume={() => {
        if (block && block.status !== "ongoing") start(block.id);
        setTaskStatus(task.id, "doing");
        setPaused(null);
      }}
      onStop={() => {
        if (task.status === "doing") setTaskStatus(task.id, "todo");
        setPaused(null);
      }}
      onDone={() => {
        setTaskStatus(task.id, "done");
        setPaused(null);
      }}
    />
  );
}
