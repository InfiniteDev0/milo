"use client";

// Changing a coming day before it arrives: a task sits one day out, or a block steps aside ahead of time.

import { useCallback } from "react";
import { EMPTY_PLAN } from "@/lib/db/plans";

export function usePlanActions({ plans, todayStamp, tasks, writePlan, reconcile }) {
  // a task sits one day out; `skip` false brings it back
  const skipTask = useCallback(
    (forStamp, taskId, skip = true) => {
      // something already started today is part of today
      const started = tasks.find((t) => t.id === taskId)?.status !== "todo";
      if (skip && forStamp === todayStamp && started) return;

      const plan = plans[forStamp] ?? EMPTY_PLAN;
      const skipped = skip
        ? [...new Set([...plan.skipped, taskId])]
        : plan.skipped.filter((x) => x !== taskId);
      if (!writePlan(forStamp, { ...plan, skipped })) return;

      // skipping the last open task finishes a block today; bringing it back reopens one
      if (forStamp === todayStamp) reconcile(tasks, new Set(skipped));
    },
    [plans, todayStamp, tasks, writePlan, reconcile],
  );

  // a block set aside for a coming day; today's own set-aside is dropBlock
  const setAsideAhead = useCallback(
    (forStamp, blockId, aside = true) => {
      const plan = plans[forStamp] ?? EMPTY_PLAN;
      const setAside = aside
        ? [...new Set([...plan.setAside, blockId])]
        : plan.setAside.filter((x) => x !== blockId);
      writePlan(forStamp, { ...plan, setAside });
    },
    [plans, writePlan],
  );

  return { skipTask, setAsideAhead };
}
