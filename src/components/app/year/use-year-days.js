"use client";

// This year's days, loaded once for the year page, with today laid over from what's live.
// A failed read says so; it never passes for a year with nothing in it.

import { useEffect, useState } from "react";
import { loadYearDays } from "@/lib/db/year";
import { todayRow, withToday } from "@/lib/year-stats";
import { useBlocks } from "../blocks-provider";

export function useYearDays(year) {
  const { blocks, tasks, todayStamp, hydrated } = useBlocks();
  const [state, setState] = useState({ rows: [], ready: false, failed: false });

  useEffect(() => {
    let alive = true;
    loadYearDays(year)
      .then((rows) => alive && setState({ rows, ready: true, failed: false }))
      .catch((err) => {
        console.warn("[milo] could not load this year's days", err);
        if (alive) setState({ rows: [], ready: true, failed: true });
      });
    return () => {
      alive = false;
    };
  }, [year]);

  const ready = state.ready && hydrated;
  const rows = ready && !state.failed ? withToday(state.rows, todayRow(todayStamp, blocks, tasks)) : [];
  return { rows, ready, failed: state.failed };
}
