"use client";

// Changing tasks: their days, kind, time, note, order and status. A change to a task's shape reaches the database.

import { useCallback } from "react";
import { createTask, deleteTask, saveTask, saveTaskOrder } from "@/lib/db/blocks";
import { queueWrite, writeNow } from "@/lib/db/sync";
import { closeSessions, openSession } from "@/lib/day/intervals";
import { blockFinished, moreToCome } from "@/lib/day/work";
import { playBlock, playTask } from "@/lib/sound";
import { celebrateTask } from "../celebrate";

export function useTaskActions({
  userId,
  tasks,
  setTasks,
  blocks,
  setBlocks,
  setSessions,
  setFocusLocked,
  setRest,
  restMinutes,
  skippedToday,
  reconcile,
  holdMood,
  resetRun,
  bumpRun,
}) {
  // `next` is built outside setTasks: an updater must be pure, and React runs it twice in development
  const setTaskDays = useCallback(
    (id, days) => {
      const next = tasks.map((t) => (t.id === id ? { ...t, days } : t));
      const task = next.find((t) => t.id === id);
      if (task) queueWrite(`task:${id}`, () => saveTask(task), { wait: 300 });
      setTasks(next);
      reconcile(next);
    },
    [tasks, reconcile, setTasks],
  );

  // a routine comes back every day it is scheduled for; a once-task leaves when it is done
  const setTaskKind = useCallback(
    (id, kind) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, kind } : t));
        const task = next.find((t) => t.id === id);
        if (task) queueWrite(`task:${id}`, () => saveTask(task), { wait: 300 });
        return next;
      });
    },
    [setTasks],
  );

  const setTaskMinutes = useCallback(
    (id, minutes) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, minutes } : t));
        const task = next.find((t) => t.id === id);
        if (task) queueWrite(`task:${id}`, () => saveTask(task), { wait: 400 });
        return next;
      });
    },
    [setTasks],
  );

  const setTaskNote = useCallback(
    (id, note) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, note } : t));
        const task = next.find((t) => t.id === id);
        // typing, so it waits for you to stop
        if (task) queueWrite(`task:${id}`, () => saveTask(task));
        return next;
      });
    },
    [setTasks],
  );

  // a task can be added any day; a block cannot — the month decides the containers, the day fills them
  const addTask = useCallback(
    (blockId, name, minutes = null) => {
      const clean = name.trim();
      if (!clean || !blockId) return;

      const task = {
        id: crypto.randomUUID(),
        blockId,
        name: clean,
        reason: "",
        note: "",
        minutes,
        status: "todo",
        kind: "routine",
        days: [],
        steps: [],
      };

      // a new task has no days, so it is today's — a finished block reopens
      const next = [...tasks, task];
      setTasks(next);
      reconcile(next);

      if (userId) {
        const at = tasks.filter((t) => t.blockId === blockId).length;
        writeNow(`task:${task.id}`, () => createTask(userId, task, at));
      }
    },
    [userId, tasks, reconcile, setTasks],
  );

  const removeTask = useCallback(
    (id) => {
      const next = tasks.filter((t) => t.id !== id);
      setTasks(next);
      reconcile(next);
      writeNow(`task:${id}`, () => deleteTask(id));
    },
    [tasks, reconcile, setTasks],
  );

  // the whole finished order, because the list reflows live while you drag; written straight away
  const reorderTasks = useCallback(
    (blockId, orderedIds) => {
      setTasks((prev) => {
        const mine = prev.filter((t) => t.blockId === blockId);
        const byId = new Map(mine.map((t) => [t.id, t]));
        const ordered = orderedIds.map((id) => byId.get(id)).filter(Boolean);
        if (ordered.length !== mine.length) return prev;

        writeNow(`tasks:order:${blockId}`, () => saveTaskOrder(ordered));

        // rebuilt in place: this block's tasks in the new order, every other task where it was
        const queue = [...ordered];
        return prev.map((t) => (t.blockId === blockId ? queue.shift() : t));
      });
    },
    [setTasks],
  );

  const setTaskStatus = useCallback(
    (taskId, nextStatus) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === nextStatus) return;

      const next = tasks.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t));
      setTasks(next);

      // the clock only moves inside a block that is running; ticking stays allowed either way
      const live = blocks.find((b) => b.id === task.blockId)?.status === "ongoing";

      if (nextStatus !== "done") {
        resetRun();
        // picking something up gets a quieter reaction: the face only, no toast
        if (nextStatus === "doing") holdMood("proud", 2500);

        // several cards can be in progress; starting another only moves the running marker
        if (live && nextStatus === "doing") {
          setSessions((log) => openSession(log, task.blockId, taskId));
        } else if (live && task.status === "doing") {
          // back to To Do: stay in the block, just not on this
          setSessions((log) => openSession(log, task.blockId));
        }

        // pulling a task back out of Done reopens its block
        reconcile(next);
        return;
      }

      const streak = bumpRun();
      // done: the clock goes back to the block, if the block has one
      if (live) setSessions((log) => openSession(log, task.blockId));
      const blockComplete = blockFinished(next, task.blockId, skippedToday);

      // the block's sound stands in for the task's; two cues at once is noise
      if (blockComplete) playBlock();
      else playTask();

      if (blockComplete) {
        setFocusLocked(false);
        setBlocks((prev) =>
          prev.map((b) =>
            // completedAt orders the finished end of the lineup, so the day reads in the order it happened
            b.id === task.blockId ? { ...b, status: "done", completedAt: Date.now() } : b,
          ),
        );
        setSessions((log) => closeSessions(log));

        // 0 means never, so no timer at all rather than one that fires instantly
        if (restMinutes > 0 && moreToCome(blocks, task.blockId)) {
          setRest({
            until: Date.now() + restMinutes * 60000,
            blockName: blocks.find((b) => b.id === task.blockId)?.name ?? "",
          });
        }
      }

      const block = blocks.find((b) => b.id === task.blockId);
      const mood = celebrateTask({
        task,
        block,
        doneToday: next.filter((t) => t.status === "done").length,
        blockComplete,
        run: streak,
      });

      holdMood(mood, 4000);
    },
    [
      tasks,
      blocks,
      holdMood,
      restMinutes,
      reconcile,
      skippedToday,
      resetRun,
      bumpRun,
      setTasks,
      setSessions,
      setFocusLocked,
      setBlocks,
      setRest,
    ],
  );

  return {
    setTaskDays,
    setTaskKind,
    setTaskMinutes,
    setTaskNote,
    addTask,
    removeTask,
    reorderTasks,
    setTaskStatus,
  };
}
