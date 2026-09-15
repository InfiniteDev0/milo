"use client";

// Everything the day holds, as plain state. The provider hands these to the hooks beside this file.

import { useState } from "react";
import { stampToday } from "@/lib/stamp";

export function useDayState() {
  const [blocks, setBlocks] = useState([]);
  const [tasks, setTasks] = useState([]);
  // your year and month, from the setup wizard
  const [profile, setProfile] = useState(null);
  // starting a block starts the day; there is no separate Start button
  const [day, setDay] = useState({ startedAt: null, endedAt: null });
  // finished days, newest first, holding only what got done
  const [history, setHistory] = useState([]);
  // today's interval log; yesterday's rolls into history
  const [sessions, setSessions] = useState([]);
  // set when a block completes: { until, blockName }
  const [rest, setRest] = useState(null);
  // { pausedAt, blockId, taskId, note }, null while the day runs; one object so block and task never disagree
  const [pause, setPause] = useState(null);
  // the lineup shows only the running block; it can always be opened by hand
  const [focusLocked, setFocusLocked] = useState(false);
  const [restMinutes, setRestMinutes] = useState(5);
  // how often a running block says how long it has run; 0 is never
  const [checkInMinutes, setCheckInMinutes] = useState(60);
  // morning, pause and night: each optional, and a day with one is as complete as a day with three
  const [journal, setJournal] = useState({ morning: "", pause: "", night: "" });
  // today's stamp as state, so the midnight roll re-derives everything keyed by the day
  const [todayStamp, setTodayStamp] = useState(stampToday);
  // days prepared ahead, by stamp: { skipped, setAside }; today's and tomorrow's are loaded
  const [plans, setPlans] = useState({});
  // a plan read that failed writes nothing, the same rule the day itself keeps
  const [plansReady, setPlansReady] = useState(false);

  return {
    blocks, setBlocks,
    tasks, setTasks,
    profile, setProfile,
    day, setDay,
    history, setHistory,
    sessions, setSessions,
    rest, setRest,
    pause, setPause,
    focusLocked, setFocusLocked,
    restMinutes, setRestMinutes,
    checkInMinutes, setCheckInMinutes,
    journal, setJournal,
    todayStamp, setTodayStamp,
    plans, setPlans,
    plansReady, setPlansReady,
  };
}
