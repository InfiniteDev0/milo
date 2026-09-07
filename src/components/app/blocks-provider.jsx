"use client";

/* One source of truth for today's blocks and tasks, shared by the rail, the
 * ongoing card and the board.
 *
 * The rail lives in the layout and the page lives in {children}, so they're
 * siblings with no way to talk to each other. This provider wraps both.
 *
 * NOTE ON TASKS: a task belongs to a BLOCK, never to a date. There is no
 * dueDate field here and there must never be one — that is what makes "nothing
 * is ever overdue" true by construction rather than by us remembering.
 *
 * Placeholder data until the schema lands. When it does, this is the only file
 * that changes.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { playBlock, playLock, playTask } from "@/lib/sound";
import { celebrateTask } from "./celebrate";

// Each block owns its colour. `ink` is the text colour that sits on it, and
// TaskRings inherits that through currentColor.
const INITIAL_BLOCKS = [
  { id: "morning", name: "Morning Block", status: "done", bg: "#F5C542", ink: "#1a1400" },
  { id: "deep", name: "Deep Work Block", status: "ongoing", bg: "#2E5BFF", ink: "#ffffff" },
  { id: "learning", name: "Learning Block", status: "todo", bg: "#5ECBA1", ink: "#04231a" },
  { id: "create", name: "Create Block", status: "todo", bg: "#F5836A", ink: "#2b0d05" },
  { id: "wind", name: "Wind Down Block", status: "todo", bg: "#A78BFA", ink: "#1c0f3d" },
];

const INITIAL_TASKS = [
  { id: "m1", blockId: "morning", name: "Waking up Adhkar", reason: "", minutes: 5, status: "todo" },
  { id: "m2", blockId: "morning", name: "Take good Wudhu", reason: "", minutes: 5, status: "todo" },
  { id: "m3", blockId: "morning", name: "Brush your teeth", reason: "", minutes: 5, status: "todo" },
  { id: "m4", blockId: "morning", name: "Adhkar after wudhu", reason: "", minutes: 5, status: "todo" },
  { id: "m5", blockId: "morning", name: "Pray Fajr at mosque", reason: "", minutes: 30, status: "todo" },
  { id: "m6", blockId: "morning", name: "Drink Water", reason: "", minutes: 2, status: "todo" },
  { id: "m7", blockId: "morning", name: "Adkhar as Sabax", reason: "", minutes: 10, status: "todo" },
  { id: "m8", blockId: "morning", name: "Read Quran  or Listen to quran", reason: "", minutes: 20, status: "todo" },
  { id: "m9", blockId: "morning", name: "Meditate for 15min", reason: "", minutes: 15, status: "todo" },
  { id: "m10", blockId: "morning", name: "Journal", reason: "", minutes: 15, status: "todo" },
  { id: "m11", blockId: "morning", name: "Make a deep work routine for that day", reason: "", minutes: 10, status: "todo" },
  { id: "l1", blockId: "learning", name: "Articulation and Communication", reason: "", minutes: 30, status: "todo" },
  { id: "l2", blockId: "learning", name: "Python Lessons", reason: "", minutes: 45, status: "todo" },
  { id: "l3", blockId: "learning", name: "DEV OPS", reason: "", minutes: 45, status: "todo" },
  { id: "l4", blockId: "learning", name: "Editing Skills", reason: "", minutes: 30, status: "todo" },
  { id: "l5", blockId: "learning", name: "Crash Course Psychology", reason: "", minutes: 25, status: "todo" },
  // { id: "t4", blockId: "deep", name: "Draft the spec", reason: "The build stalls until this is written down", minutes: 60, status: "done" },
  // { id: "t5", blockId: "deep", name: "Ship the auth flow", reason: "Everything after it is blocked on this", minutes: 90, status: "doing" },
  // { id: "t6", blockId: "deep", name: "Review PRs", reason: "People are waiting on me", minutes: 30, status: "todo" },
  // { id: "t7", blockId: "deep", name: "Write the migration", reason: "Get the invariants into the schema while they're fresh", minutes: 45, status: "todo" },
  // { id: "t8", blockId: "learning", name: "Read one chapter", reason: "Slow and steady beats a weekend binge", minutes: 30, status: "todo" },
  // { id: "t9", blockId: "create", name: "Record a build clip", reason: "Building in public only works if I post", minutes: 25, status: "todo" },
  // { id: "t10", blockId: "wind", name: "Plan tomorrow", reason: "So the morning starts with a decision already made", minutes: 10, status: "todo" },
];

const BlocksContext = createContext(null);


/* A day resets to untouched, never to empty: the blocks you shaped are still
   there in the morning, just unstarted. `completedAt` goes with the status it
   belonged to, so nothing from yesterday can order today's line. */
const freshBlocks = (bs) =>
  bs.map(({ completedAt, ...b }) => ({ ...b, status: "todo", dropped: false }));

const freshTasks = (ts) => ts.map((t) => ({ ...t, status: "todo" }));

/* THE INTERVAL LOG. See ../TIME.md for why this shape and not a counter.

   Exactly one interval is ever open — the same invariant as one block
   ongoing, one level down. Time always belongs to a block; taskId is null
   when you are in the block but not on a particular task, and that is a real
   category (thinking, reading, getting started), not a gap.

   Because only one runs at a time, block time and task time can never
   disagree, so the interface cannot provoke 'where did the other hour go?'. */

const openSession = (list, blockId, taskId = null, at = Date.now()) => [
  ...closeSessions(list, at),
  { id: `s${at}`, day: stampToday(), blockId, taskId, startedAt: at, endedAt: null },
];

const closeSessions = (list, at = Date.now()) =>
  list.map((x) =>
    x.endedAt === null ? { ...x, endedAt: Math.max(at, x.startedAt) } : x,
  );

const spentOn = (list, match, now = Date.now()) =>
  list
    .filter(match)
    .reduce((ms, x) => ms + ((x.endedAt ?? now) - x.startedAt), 0);

/* Recovery. A tab that dies leaves an interval open; restored from
   `startedAt` alone it would claim every hour since. So a heartbeat records
   when we last knew the user was there, and anything open is trimmed back to
   that. It reports what was observed and never invents time. */
const SEEN_KEY = "milo:seen";
const STALE = 2 * 60 * 1000;

function recover(list) {
  const open = list.find((x) => x.endedAt === null);
  if (!open) return list;

  let seen = 0;
  try {
    seen = Number(window.localStorage.getItem(SEEN_KEY)) || 0;
  } catch {}

  const now = Date.now();
  // still warm, and still the same day: pick the interval back up
  if (now - seen < STALE && open.day === stampToday()) return list;

  return closeSessions(list, Math.max(seen, open.startedAt));
}

/* What a finished day leaves behind.

   ONLY what happened. No target, no total it was measured against, and no
   entry at all for a day where nothing finished — so a day you sat out is
   absent from the history rather than present as a zero. Absent and
   never-existed look the same, which is the point.

   Returns null when there is nothing to record. */
const summarise = (blocks, tasks, sessions, stamp, label) => {
  const done = blocks
    .filter((b) => b.status === "done")
    .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0))
    .map(({ id, name, bg, ink }) => ({ id, name, bg, ink }));

  const finished = tasks.filter((t) => t.status === "done");
  if (done.length === 0 && finished.length === 0) return null;

  return {
    date: stamp,
    label,
    blocks: done,
    tasks: finished.length,
    /* Time actually spent, not the sum of the estimates. Those are different
       numbers and only one of them is true — and TIME.md forbids ever showing
       them together, so the record keeps the real one. */
    minutes: Math.round(spentOn(sessions, (x) => x.day === stamp) / 60000),
  };
};

// Local date, not UTC — the day rolls over at the user's midnight.
const stampToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

/* Stamped as a string when the day is filed, never formatted from the stamp
   at render — that would disagree between the server and the browser and
   React would report it as a hydration mismatch. */
const labelFor = (stamp) => {
  const [y, m, d] = stamp.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

export function BlocksProvider({ children }) {
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  // Milo holds a pose for a beat after something finishes, then goes back to
  // reacting on its own. undefined = autonomous.
  const [profile, setProfile] = useState(null);

  /* The day has no Start button. Starting a block IS starting the day —
     a separate start is one more thing to do before doing things, and
     forgetting it would make a real day retroactively not count. */
  const [day, setDay] = useState({ startedAt: null, endedAt: null });

  /* Days that have finished. Append-only, newest first, and it holds only
     what got done — see `summarise`. */
  const [history, setHistory] = useState([]);

  // the interval log for today; yesterday's rolls into `history` and is dropped
  const [sessions, setSessions] = useState([]);

  // Set when a block completes. { until, blockName } — the one notification
  // in the product, and the user decides how loud it is.
  const [rest, setRest] = useState(null);

  /* Pausing the whole day, for the interruptions that don't wait for a block
     to finish. The running block is remembered so resuming puts you back
     exactly where you were — leaving is never loss, one level up from the
     per-block rule. A paused day accrues nothing and is never reported as
     time lost. */
  const [paused, setPaused] = useState(false);

  /* Focus lock — the lineup shows only the running block. Seeing the whole
     day at once is what turns a list into a demand, so this is the release
     valve. It opens itself when the block finishes, and can always be
     opened by hand: a lock you can't get out of is coercion. */
  const [focusLocked, setFocusLocked] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  const [restMinutes, setRestMinutes] = useState(5);
  const [miloMood, setMiloMood] = useState(undefined);
  const moodTimer = useRef(null);
  const run = useRef(0); // consecutive completions, for the escalating lines

  /* Everything lives in localStorage until there's a database.

     Read AFTER mount, never during render — reading storage while rendering
     makes the server and client disagree and React reports a hydration
     mismatch. `hydrated` then gates the save, so the first render's
     placeholder data can't overwrite what was actually stored. */
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("milo:state");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.profile) setProfile(saved.profile);

        /* Same day: pick it up exactly where it was left. A different day:
           everything resets to untouched. Yesterday does not follow you in
           — no carry-over, no backlog, no count of what didn't happen. The
           day you did is kept in the stamp and nowhere else. */
        const sameDay = saved.dayStamp === stampToday();
        if (saved.blocks) setBlocks(sameDay ? saved.blocks : freshBlocks(saved.blocks));
        if (saved.tasks) setTasks(sameDay ? saved.tasks : freshTasks(saved.tasks));
        if (sameDay && saved.day) setDay(saved.day);
        // a new day starts with an empty log; the old one is summarised below
        setSessions(sameDay ? recover(saved.sessions ?? []) : []);

        /* Coming back on a later day: file what the old one held before the
           reset above throws it away. This is the only chance — after this
           the blocks are untouched again and there is nothing left to read. */
        const past = saved.history ?? [];
        const entry =
          !sameDay && saved.dayStamp
            ? summarise(
                saved.blocks ?? [],
                saved.tasks ?? [],
                saved.sessions ?? [],
                saved.dayStamp,
                labelFor(saved.dayStamp),
              )
            : null;
        setHistory(
          entry && !past.some((h) => h.date === entry.date)
            ? [entry, ...past]
            : past,
        );
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        "milo:state",
        JSON.stringify({ blocks, tasks, profile, day, history, sessions, dayStamp: stampToday() }),
      );
    } catch {}
  }, [hydrated, blocks, tasks, profile, day, history, sessions]);

  /* Marks that the user is still here, so a tab that dies can be trimmed back
     to the last moment we actually observed rather than to now. */
  const running = sessions.some((x) => x.endedAt === null);
  useEffect(() => {
    if (!running) return;
    const mark = () => {
      try {
        window.localStorage.setItem(SEEN_KEY, String(Date.now()));
      } catch {}
    };
    mark();
    const t = setInterval(mark, 15000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => () => clearTimeout(moodTimer.current), []);

  // What the setup wizard hands back. Blocks become the real ones, tasks
  // start empty — a new day has nothing in it yet, and that is fine.
  const completeSetup = useCallback(
    ({ year, month, blocks: chosen, tasksByBlock = {} }) => {
      setProfile({ year, month });
      setBlocks(
        chosen.map((b, i) => ({
          ...b,
          name: b.name.endsWith(" Block") ? b.name : `${b.name} Block`,
          status: i === 0 ? "ongoing" : "todo",
        })),
      );

      // Tasks are assigned at setup and fixed for this MVP. 15 minutes is a
      // placeholder duration, not an estimate anyone was asked for — nothing
      // in the product compares against it.
      setTasks(
        chosen.flatMap((b) =>
          (tasksByBlock[b.id] ?? []).map((name, i) => ({
            id: `${b.id}-${i}`,
            blockId: b.id,
            name,
            reason: "",
            minutes: 15,
            status: "todo",
          })),
        ),
      );
    },
    [],
  );

  /* Tasks are composed on the Monthly page — the month decides what a day is
     made of, the day just runs it. Added straight to a block, never to a date. */
  const addTask = useCallback((blockId, name, minutes = 15) => {
    const clean = name.trim();
    if (!clean) return;
    setTasks((prev) => [
      ...prev,
      {
        id: `t${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        blockId,
        name: clean,
        reason: "",
        minutes,
        status: "todo",
      },
    ]);
  }, []);

  const removeTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pauseDay = useCallback(() => {
    // a paused day accrues nothing, and that is not a penalty — it is the truth
    setSessions((log) => closeSessions(log));
    const current = blocks.find((b) => b.status === "ongoing");
    setResumeId(current?.id ?? null);
    setBlocks((prev) =>
      prev.map((b) => (b.status === "ongoing" ? { ...b, status: "paused" } : b)),
    );
    setRest(null);
    setPaused(true);
  }, [blocks]);

  const resumeDay = useCallback(() => {
    setPaused(false);
    if (resumeId) {
      setSessions((log) => openSession(log, resumeId));
      setBlocks((prev) =>
        prev.map((b) => (b.id === resumeId ? { ...b, status: "ongoing" } : b)),
      );
    }
    setResumeId(null);
  }, [resumeId]);

  const endDay = useCallback(() => {
    setDay((d) => ({ ...d, endedAt: Date.now() }));
    setRest(null);
  }, []);

  /* Wipes the day and hands back the same blocks, untouched. Runs on its own
     when the calendar date changes, and by hand from the closing screen.

     What it leaves behind is a record of what got DONE, and nothing else. A
     finished day and an abandoned one still reset to exactly the same place;
     the difference is that the finished one has something worth keeping. A
     day with nothing in it files nothing, so it can never accumulate. */
  const newDay = useCallback(() => {
    const stamp = stampToday();
    const entry = summarise(blocks, tasks, sessions, stamp, labelFor(stamp));
    if (entry) {
      setHistory((prev) => [
        entry,
        ...prev.filter((h) => h.date !== entry.date),
      ]);
    }

    setBlocks(freshBlocks);
    setTasks(freshTasks);
    setSessions([]);
    setDay({ startedAt: null, endedAt: null });
    setRest(null);
    setPaused(false);
    setResumeId(null);
    setFocusLocked(false);
  }, [blocks, tasks]);

  const skipRest = useCallback(() => setRest(null), []);

  const holdMood = useCallback((mood, ms) => {
    setMiloMood(mood);
    clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setMiloMood(undefined), ms);
  }, []);

  /* Starting one pauses whatever was running — the one-ongoing rule. Postgres
     will enforce it too (a unique partial index), but it has to hold here as
     well or the UI can show a state the database would refuse. */
  const start = useCallback((id) => {
    setDay((d) => (d.startedAt ? d : { ...d, startedAt: Date.now() }));
    setPaused(false);
    setRest(null);

    /* Starting the block IS starting the clock — no separate arm step. A
       second ritual you can forget produces a day that didn't count, which is
       the artifact POSITIONING commitment 2 forbids.

       Read from `blocks` rather than from inside a setBlocks updater: an
       updater has to be pure, and React runs it twice in development, so
       nesting a setState in there opened two intervals per click. */
    const stopping = blocks.find((b) => b.id === id)?.status === "ongoing";
    setSessions((log) =>
      stopping ? closeSessions(log) : openSession(log, id),
    );
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: b.status === "ongoing" ? "paused" : "ongoing" }
          : b.status === "ongoing"
            ? { ...b, status: "paused" }
            : b,
      ),
    );
  }, [blocks]);

  /* Dropping a block into the day starts it AND moves it to the front of
     the lineup, so the line ends up ordered by how the day actually went
     rather than by a plan made in advance. */
  /* Drop one block onto another to move it there. Order is the only thing
     that decides what comes first in Milo — there is no priority flag — so
     reshuffling the line is how you say what matters today. */
  /* Sound on the way IN only. Unlocking is not a failure and gets no noise
     — a chime for leaving would turn the release valve into a judgement. */
  const toggleFocusLock = useCallback(
    () =>
      setFocusLocked((v) => {
        if (!v) playLock();
        return !v;
      }),
    [],
  );

  /* The archive. Blocks you aren't running right now live here instead of in
     the lineup — you choose how many blocks a day holds, and the rest wait
     out of sight.

     It is not a bin and it is not a backlog: nothing counts what's in it,
     nothing reports how long something has sat there, and coming back is one
     click. An archive that keeps score is just an overdue list with a nicer
     name. */
  const archiveBlock = useCallback((id) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, archived: true, status: b.status === "ongoing" ? "todo" : b.status }
          : b,
      ),
    );
  }, []);

  /* Dropping a block. Different from archiving: archive is a shelf that
     persists, dropping is for TODAY only — 'I can only do three of these',
     and tomorrow they're all back.

     This is PRODUCT.md's skip, made deliberate and reversible. A dropped
     block is not a failed one: nothing records it, nothing counts it, and
     picking it back up later costs one click. */
  const dropBlock = useCallback((id) => {
    // A finished block is a fact about the day. Dropping it would delete
      // something that actually happened, so it simply isn't allowed.
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id && b.status !== "done"
          ? { ...b, dropped: true, status: b.status === "ongoing" ? "todo" : b.status }
          : b,
      ),
    );
  }, []);

  const undropBlock = useCallback((id) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, dropped: false } : b)),
    );
  }, []);

  const restoreBlock = useCallback((id) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, archived: false } : b)),
    );
  }, []);

  const reorderBlocks = useCallback((fromId, toId) => {
    if (fromId === toId) return;
    setBlocks((prev) => {
      const from = prev.findIndex((b) => b.id === fromId);
      const to = prev.findIndex((b) => b.id === toId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const startAndLead = useCallback((id) => {
    setDay((d) => (d.startedAt ? d : { ...d, startedAt: Date.now() }));
    setPaused(false);
    setRest(null);
    setSessions((log) => openSession(log, id));
    setBlocks((prev) => {
      const target = prev.find((b) => b.id === id);
      if (!target) return prev;
      const others = prev
        .filter((b) => b.id !== id)
        .map((b) => (b.status === "ongoing" ? { ...b, status: "paused" } : b));
      return [{ ...target, status: "ongoing" }, ...others];
    });
  }, []);

  const setTaskStatus = useCallback(
    (taskId, nextStatus) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === nextStatus) return;

      const next = tasks.map((t) =>
        t.id === taskId ? { ...t, status: nextStatus } : t,
      );
      setTasks(next);

      if (nextStatus !== "done") {
        run.current = 0;
        // picking something up is worth a reaction too, just a quieter one:
        // the face only, no toast — a toast on every drag would be noise
        if (nextStatus === "doing") holdMood("proud", 2500);

        /* In Progress can hold several cards; exactly one is RUNNING. Starting
           another moves the marker and nothing else — the previous card keeps
           its place and its time. Same mechanic as blocks, one level down, so
           there is no new rule anyone can break. */
        if (nextStatus === "doing") {
          setSessions((log) => openSession(log, task.blockId, taskId));
        } else if (task.status === "doing") {
          // back to To Do: stay in the block, just not on this
          setSessions((log) => openSession(log, task.blockId));
        }
        return;
      }

      run.current += 1;
      // done: the clock goes back to the block, which is still running
      setSessions((log) => openSession(log, task.blockId));
      const mine = next.filter((t) => t.blockId === task.blockId);
      const blockComplete = mine.every((t) => t.status === "done");

      /* The block's sound stands in for the task's. Two cues on top of each
         other on the last task of a block is noise, not a reward. */
      if (blockComplete) playBlock();
      else playTask();

      if (blockComplete) {
        setFocusLocked(false);
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === task.blockId
              // completedAt is what orders the finished end of the lineup,
              // so the day reads left to right in the order it happened
              ? { ...b, status: "done", completedAt: Date.now() }
              : b,
          ),
        );
        setSessions((log) => closeSessions(log));
        setRest({
          until: Date.now() + restMinutes * 60000,
          blockName: blocks.find((b) => b.id === task.blockId)?.name ?? "",
        });
      }

      const block = blocks.find((b) => b.id === task.blockId);
      const mood = celebrateTask({
        task,
        block,
        doneToday: next.filter((t) => t.status === "done").length,
        blockComplete,
        run: run.current,
      });

      holdMood(mood, 4000);
    },
    [tasks, blocks, holdMood, restMinutes],
  );

  const value = useMemo(() => {
    const blockById = Object.fromEntries(blocks.map((b) => [b.id, b]));
    const inPlay = blocks.filter((b) => !b.archived);
    const live = inPlay.filter((b) => !b.dropped);
    const droppedToday = inPlay.filter((b) => b.dropped);
    const archived = blocks.filter((b) => b.archived);

    // counts per block, derived — never stored, so they can't drift
    const countsFor = (blockId) => {
      const mine = tasks.filter((t) => t.blockId === blockId);
      return {
        todo: mine.filter((t) => t.status === "todo").length,
        doing: mine.filter((t) => t.status === "doing").length,
        done: mine.filter((t) => t.status === "done").length,
      };
    };

    const ongoingBlock = live.find((b) => b.status === "ongoing") ?? null;

    return {
      blocks: live,
      archived,
      droppedToday,
      tasks,
      blockById,
      start,
      startAndLead,
      focusLocked,
      archiveBlock,
      restoreBlock,
      dropBlock,
      undropBlock,
      toggleFocusLock,
      reorderBlocks,
      setTaskStatus,
      countsFor,
      addTask,
      removeTask,
      day,
      history,
      sessions,
      /* Derived, never stored. `now` is passed in by the caller so a ticking
         component controls its own refresh rate instead of the provider
         re-rendering the whole app once a second. */
      spentOnBlock: (id, now) => spentOn(sessions, (x) => x.blockId === id, now),
      spentOnTask: (id, now) => spentOn(sessions, (x) => x.taskId === id, now),
      spentToday: (now) => spentOn(sessions, () => true, now),
      // which task the clock is on right now, if any
      runningTaskId:
        sessions.find((x) => x.endedAt === null)?.taskId ?? null,
      /* False until localStorage has been read. Everything before that is
         placeholder data, so anything that would flash the wrong answer
         waits on this instead of rendering twice. */
      hydrated,
      endDay,
      newDay,
      rest,
      skipRest,
      paused,
      pauseDay,
      resumeDay,
      restMinutes,
      setRestMinutes,
      // Only ever counts up. No target, no percentage, no gap.
      summary: {
        done: tasks.filter((t) => t.status === "done").length,
        blocksDone: blocks.filter((b) => b.status === "done").length,
        // time you spent, never time you had left
        minutes: tasks
          .filter((t) => t.status === "done")
          .reduce((m, t) => m + (t.minutes ?? 0), 0),
        startedAt: day.startedAt,
      },
      miloMood: paused ? "sleepy" : miloMood,
      profile,
      completeSetup,
      ongoing: ongoingBlock
        ? { ...ongoingBlock, ...countsFor(ongoingBlock.id) }
        : null,
    };
  }, [hydrated, blocks, tasks, start, startAndLead, reorderBlocks, focusLocked, toggleFocusLock, archiveBlock, restoreBlock, dropBlock, undropBlock, setTaskStatus, miloMood, profile, completeSetup, addTask, removeTask, day, history, sessions, endDay, newDay, rest, skipRest, restMinutes, paused, pauseDay, resumeDay]);

  return <BlocksContext.Provider value={value}>{children}</BlocksContext.Provider>;
}

export function useBlocks() {
  const ctx = useContext(BlocksContext);
  if (!ctx) throw new Error("useBlocks must be used inside <BlocksProvider>");
  return ctx;
}
