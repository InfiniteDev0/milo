"use client";

// Watches the task the clock is on. When it has run for the minutes you set, Milo says so once — never a countdown,
// never "late". Time that had already passed before the app opened is not announced after the fact.

import { useEffect, useRef } from "react";
import { usePreference } from "@/hooks/use-preference";
import { playLock } from "@/lib/sound";
import { TASK_TIMER, notifyDesktop } from "@/lib/task-timer";
import { useNow } from "@/lib/time";
import { useBlocks } from "../blocks-provider";
import { showTimerToast } from "./timer-toast";

export function TaskTimer() {
  const { tasks, runningTaskId, spentOnTask, setTaskStatus } = useBlocks();
  const mode = usePreference(TASK_TIMER);

  const task = runningTaskId ? (tasks.find((t) => t.id === runningTaskId) ?? null) : null;
  const armed = mode !== "off" && task != null && task.minutes > 0;
  const now = useNow(armed, 10000);

  // timers already looked at, and timers already announced; a changed timer is a new one
  const looked = useRef(new Set());
  const told = useRef(new Set());

  useEffect(() => {
    if (!armed || now == null) return;

    const key = `${task.id}:${task.minutes}`;
    const over = spentOnTask(task.id, now) >= task.minutes * 60000;

    // the first look: time already past is history, not news
    if (!looked.current.has(key)) {
      looked.current.add(key);
      if (over) told.current.add(key);
      return;
    }
    if (!over || told.current.has(key)) return;

    told.current.add(key);
    playLock();
    showTimerToast({
      key,
      minutes: task.minutes,
      name: task.name,
      onDone: () => setTaskStatus(task.id, "done"),
    });
    if (mode === "desktop") {
      notifyDesktop("Milo", `${task.minutes} minutes on ${task.name}. The time you set.`, key);
    }
  }, [armed, now, task, mode, spentOnTask, setTaskStatus]);

  return null;
}
