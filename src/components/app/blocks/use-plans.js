"use client";

// The Day ahead's plans: which tasks sit today out, and the one safe way to change a plan.

import { useCallback, useMemo } from "react";
import { savePlanSoon } from "@/lib/db/plan-queue";

export function usePlans({ plans, setPlans, plansReady, todayStamp, userId }) {
  const skippedToday = useMemo(
    () => new Set(plans[todayStamp]?.skipped ?? []),
    [plans, todayStamp],
  );

  // a plan is only ever what you decided; a plan that couldn't be read is never written over
  const writePlan = useCallback(
    (forStamp, plan) => {
      if (!plansReady || !userId) return false;
      setPlans((prev) => ({ ...prev, [forStamp]: plan }));
      savePlanSoon(userId, forStamp, plan);
      return true;
    },
    [plansReady, userId, setPlans],
  );

  return { skippedToday, writePlan };
}
