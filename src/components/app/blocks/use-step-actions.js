"use client";

// The steps inside a task: add, tick, reorder and remove. A tick is something you'd notice losing, so it writes at once.

import { useCallback } from "react";
import { createStep, deleteStep, saveStep, saveStepOrder } from "@/lib/db/blocks";
import { writeNow } from "@/lib/db/sync";

export function useStepActions({ userId, tasks, setTasks }) {
  const addStep = useCallback(
    (taskId, name) => {
      const clean = name.trim();
      if (!clean) return;
      const step = { id: crypto.randomUUID(), name: clean, done: false };
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, steps: [...(t.steps ?? []), step] } : t)),
      );

      // immediate: everything after this is an update against this id
      if (userId) {
        const at = (tasks.find((t) => t.id === taskId)?.steps ?? []).length;
        writeNow(`step:${step.id}`, () => createStep(userId, taskId, step, at));
      }
    },
    [userId, tasks, setTasks],
  );

  const toggleStep = useCallback(
    (taskId, stepId) => {
      setTasks((prev) => {
        const next = prev.map((t) =>
          t.id === taskId
            ? { ...t, steps: (t.steps ?? []).map((x) => (x.id === stepId ? { ...x, done: !x.done } : x)) }
            : t,
        );
        const step = next.find((t) => t.id === taskId)?.steps.find((x) => x.id === stepId);
        if (step) writeNow(`step:${stepId}`, () => saveStep(step));
        return next;
      });
    },
    [setTasks],
  );

  // takes the finished order, because the list reflows live while you drag
  const reorderSteps = useCallback(
    (taskId, orderedIds) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const byId = new Map((t.steps ?? []).map((x) => [x.id, x]));
          const steps = orderedIds.map((id) => byId.get(id)).filter(Boolean);
          if (steps.length !== (t.steps ?? []).length) return t;
          writeNow(`steps:order:${taskId}`, () => saveStepOrder(steps));
          return { ...t, steps };
        }),
      );
    },
    [setTasks],
  );

  const removeStep = useCallback(
    (taskId, stepId) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, steps: (t.steps ?? []).filter((x) => x.id !== stepId) } : t,
        ),
      );
      writeNow(`step:${stepId}`, () => deleteStep(stepId));
    },
    [setTasks],
  );

  return { addStep, toggleStep, reorderSteps, removeStep };
}
