"use client";

// One source of truth for today's blocks and tasks, shared by the lineup, the board and every sheet.
// A task belongs to a BLOCK, never to a date: no due date exists anywhere, so nothing can ever be overdue.
// State lives in blocks/use-day-state.js and each behaviour in its own hook beside it; this file only wires them.

import { createContext, useContext } from "react";
import { useBlockActions } from "./blocks/use-block-actions";
import { useDayActions } from "./blocks/use-day-actions";
import { useDayLoad } from "./blocks/use-day-load";
import { useDaySave } from "./blocks/use-day-save";
import { useDayState } from "./blocks/use-day-state";
import { useMidnight } from "./blocks/use-midnight";
import { useMood } from "./blocks/use-mood";
import { useNewDay } from "./blocks/use-new-day";
import { usePlanActions } from "./blocks/use-plan-actions";
import { usePlans } from "./blocks/use-plans";
import { useReconcile } from "./blocks/use-reconcile";
import { useSetup } from "./blocks/use-setup";
import { useStepActions } from "./blocks/use-step-actions";
import { useTaskActions } from "./blocks/use-task-actions";
import { useValue } from "./blocks/use-value";

const BlocksContext = createContext(null);

export function BlocksProvider({ children }) {
  const state = useDayState();
  const load = useDayLoad(state);
  const { resetSent } = useDaySave({ ...state, ...load });
  const mood = useMood();
  const plan = usePlans({ ...state, userId: load.userId });
  const reconcile = useReconcile({ ...state, ...plan, holdMood: mood.holdMood });

  const taskActions = useTaskActions({ ...state, ...plan, ...mood, userId: load.userId, reconcile });
  const stepActions = useStepActions({ ...state, userId: load.userId });
  const blockActions = useBlockActions({ ...state, ...plan, userId: load.userId });
  const planActions = usePlanActions({ ...state, ...plan, reconcile });
  const dayActions = useDayActions({ ...state, ...plan });
  const completeSetup = useSetup({ ...state, userId: load.userId });
  const filing = useNewDay({ ...state, resetSent });
  useMidnight({ ...state, hydrated: load.hydrated, newDay: filing.newDay });

  const value = useValue({
    ...state,
    ...load,
    ...mood,
    ...plan,
    ...taskActions,
    ...stepActions,
    ...blockActions,
    ...planActions,
    ...dayActions,
    ...filing,
    completeSetup,
  });

  return <BlocksContext.Provider value={value}>{children}</BlocksContext.Provider>;
}

export function useBlocks() {
  const ctx = useContext(BlocksContext);
  if (!ctx) throw new Error("useBlocks must be used inside <BlocksProvider>");
  return ctx;
}
