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
import { onDay } from "@/lib/days";
import { BLOCK_COLOURS } from "@/lib/block-colours";
import { createClient } from "@/lib/supabase/client";
import { queueWrite, writeNow } from "@/lib/db/sync";
import {
  archiveTask,
  createBlocks,
  createStep,
  createTask,
  createTasks,
  deleteBlock,
  deleteStep,
  deleteTask,
  loadShape,
  saveBlock,
  saveOrder,
  saveStep,
  saveStepOrder,
  saveTask,
  saveTaskOrder,
} from "@/lib/db/blocks";
import {
  closeAnyOpen,
  closeSessionRow,
  loadDay,
  loadHistory,
  loadSessions,
  markDayEnded,
  openSessionRow,
  saveDay,
} from "@/lib/db/days";
import { loadProfile, saveProfile } from "@/lib/db/profile";
import { celebrateTask } from "./celebrate";

/* THIS BLOCK'S WORK, TODAY. The one definition, because there used to be two.

   The board filtered by onDay and the provider did not, so the screen and the
   engine disagreed about how many tasks a block had. Move two of three tasks
   to the weekend and the board correctly showed one task, done — while the
   completion check still counted all three and refused to finish the block.

   Anything that decides whether a block is finished goes through here. */
const workToday = (list, blockId) =>
  list.filter((t) => t.blockId === blockId && onDay(t));

/* Finished means: there WAS something to do today, and it is all done.

   `length > 0` is load-bearing. Without it a block whose every task you moved
   to Friday would report done — vacuously true, and Milo would be claiming a
   completion nobody earned. A block with nothing scheduled today has not been
   finished; it simply isn't today's. */
const blockFinished = (list, blockId) => {
  const mine = workToday(list, blockId);
  return mine.length > 0 && mine.every((t) => t.status === "done");
};

/* The last millisecond of yesterday, from today's clock.

   An interval that was open across midnight belongs to the day it started
   in, not to the one you woke up in. Closing it here keeps the interval log's
   one rule — a row belongs to one date — and stops a session left running
   overnight from reporting eleven hours in Deep Work. */
const lastNight = () => {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  return midnight.getTime() - 1;
};

/* Rest is for the gap between blocks. When the last one is finished there is
   no gap — the day is the thing that just ended, and a five minute timer
   telling you to come back to nothing is the app failing to notice. */
const moreToCome = (list, justFinished) =>
  list.some(
    (b) =>
      b.id !== justFinished &&
      !b.dropped &&
      !b.archived &&
      b.status !== "done",
  );
const BlocksContext = createContext(null);

/* NO SEED DATA.

   This file used to open with five blocks and eleven tasks — real ones,
   from the author's own morning. They were the fallback whenever storage
   was empty, which meant every new account landed inside a stranger's
   routine and had to clear it out before it could start.

   An empty account is empty. The setup wizard is the only way blocks come
   into existence. */

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

// `?? Date.now()` and not a default parameter: useNow returns null on its
// first render, and a default only fills in for undefined. Passing null made
// an open interval price itself from zero, which reads as a negative total.
const spentOn = (list, match, now) => {
  const at = now ?? Date.now();
  return list
    .filter(match)
    .reduce((ms, x) => ms + ((x.endedAt ?? at) - x.startedAt), 0);
};

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
const summarise = (blocks, tasks, sessions, stamp, label, endedAt = null) => {
  const done = blocks
    .filter((b) => b.status === "done")
    .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0))
    .map(({ id, name, bg, ink }) => ({ id, name, bg, ink }));

  const finished = tasks.filter((t) => t.status === "done");
  if (done.length === 0 && finished.length === 0) return null;

  return {
    date: stamp,
    label,
    /* Set when you closed the day yourself, null when midnight did it for
       you. The difference is the whole reason the next morning knows whether
       to show you anything. */
    endedAt,
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
  const [blocks, setBlocks] = useState([]);
  const [tasks, setTasks] = useState([]);

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
     time lost.

     ONE OBJECT, not a flag beside an id. They were separate and they got
     out of step: the pause remembered the block but not the task, so
     resuming put you in the right room on nothing in particular. Anything
     that must be true at the same moment lives in the same value.

       { pausedAt, blockId, taskId, note }   — null means running

     It is written to the day row, so it survives closing the app. That
     was the actual bug: you could pause, shut the tab, and come back to
     an app with no idea it was paused. */
  const [pause, setPause] = useState(null);
  const paused = pause !== null;

  /* Focus lock — the lineup shows only the running block. Seeing the whole
     day at once is what turns a list into a demand, so this is the release
     valve. It opens itself when the block finishes, and can always be
     opened by hand: a lock you can't get out of is coercion. */
  const [focusLocked, setFocusLocked] = useState(false);
  const [restMinutes, setRestMinutes] = useState(5);

  /* How often a running block says how long it has been running. 0 = never.

     60 is a defensible default, not a law. Sustained focus starts to decline
     somewhere in the 45–90 minute range and two hours produces measurable
     drops — but the tidy 90-minute 'ultradian cycle' is explicitly not a
     universal biological schedule, so this is a reasonable middle rather than
     a number anyone should defend. It is the user's to change. */
  const [checkInMinutes, setCheckInMinutes] = useState(60);

  /* The day's three entries: morning, pause, night. One per lifecycle
     moment, exactly as they were on paper.

     Every one optional, and a day with one is as complete as a day with
     three. They belong to the DAY, not to notes — which is why they reset
     with it and appear on the close and the month grid. */
  const [journal, setJournal] = useState({
    morning: "",
    pause: "",
    night: "",
  });
  const [miloMood, setMiloMood] = useState(undefined);
  const moodTimer = useRef(null);
  const run = useRef(0); // consecutive completions, for the escalating lines

  /* Everything lives in localStorage until there's a database.

     Read AFTER mount, never during render — reading storage while rendering
     makes the server and client disagree and React reports a hydration
     mismatch. `hydrated` then gates the save, so the first render's
     placeholder data can't overwrite what was actually stored. */
  const [hydrated, setHydrated] = useState(false);

  /* DID THE LOAD ACTUALLY WORK.

     Distinct from `hydrated`, which only means we stopped waiting. A read
     that failed leaves an empty list behind, and an empty list is the exact
     signature of a brand new account — so without this, one dropped request
     puts the setup wizard in front of somebody who has been using Milo for
     a month, and completing it writes a second set of blocks over the top of
     their real ones.

     Anything that would treat 'no data' as 'new user' has to check this
     first. Absence and failure are not the same fact. */
  const [loadFailed, setLoadFailed] = useState(false);

  // bumped by retry(), which is the whole reason the load effect has a dep
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setLoadFailed(false);
    setHydrated(false);
    setAttempt((n) => n + 1);
  }, []);

  // who we are writing as. Null until the session resolves.
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const db = createClient();
        const {
          data: { user },
        } = await db.auth.getUser();
        if (!alive) return;
        setUserId(user?.id ?? null);

        // Shared by both blocks below, so it cannot live inside either one.
        let shapeById = new Map();

        if (user) {
          /* What you shaped comes from the database. What happened TODAY
             still comes from the day record below — those are different
             lifetimes and mixing them is how a block carries yesterday's
             result into this morning. */
          const [shape, saved] = await Promise.all([loadShape(), loadProfile()]);
          if (!alive) return;
          setBlocks(shape.blocks);
          setTasks(shape.tasks);
          shapeById = new Map(shape.blocks.map((b) => [b.id, b]));

          /* Your year and your month. Losing these is not losing settings —
             it is losing what you named the year, and the vision board you
             wrote in it. */
          if (saved) {
            setProfile({ year: saved.year, month: saved.month });
            setRestMinutes(saved.restMinutes);
          }
        }

        if (user) {
          /* Today's row, and the days behind it. Nothing is read from the
             browser — the whole point of this phase. */
          const stamp = stampToday();
          const [today, past, log] = await Promise.all([
            loadDay(stamp),
            loadHistory(stamp),
            loadSessions(stamp),
          ]);
          if (!alive) return;

          if (today) {
            setDay({ startedAt: today.startedAt, endedAt: today.endedAt ?? null });
            /* A pause outlives the tab but not the day. It is stored on the
               day row, so opening the app tomorrow reads a different row and
               finds no pause — nothing has to expire it. */
            setPause(today.pause ?? null);
            setJournal({
              morning: "",
              pause: "",
              night: "",
              ...today.journal,
            });

            /* Statuses are laid over the shape, never stored with it. A
               block with no entry for today is simply untouched — which is
               what makes a new day genuinely new. */
            setBlocks((prev) =>
              prev.map((b) => ({
                ...b,
                status: today.blockState[b.id]?.status ?? "todo",
                completedAt: today.blockState[b.id]?.completedAt ?? undefined,
                dropped: today.dropped.includes(b.id),
              })),
            );
            setTasks((prev) =>
              prev.map((t) => ({
                ...t,
                status: today.taskState[t.id] ?? "todo",
              })),
            );
          } else {
            // no row yet today: everything starts untouched
            setBlocks((prev) =>
              prev.map((b) => ({ ...b, status: "todo", dropped: false })),
            );
            setTasks((prev) => prev.map((t) => ({ ...t, status: "todo" })));
          }

          /* A RUNNING BLOCK WITH NO CLOCK IS NOT A STATE THAT SHOULD EXIST.

             Block status lives on the day row, the clock lives in `sessions`.
             They are separate writes, so one can land without the other — and
             when it does the block sits there saying Running while nothing is
             recorded against it. No elapsed on the card, nothing in the block
             sheet, and the check-in never fires because there is no time for
             it to count.

             Repaired by opening an interval NOW. It cannot invent the hours
             already lost — those were never recorded — but from here the clock
             runs, which is the honest half of the fix. */
          const restored = recover(log);
          const ongoingId = Object.entries(today?.blockState ?? {}).find(
            ([, v]) => v?.status === "ongoing",
          )?.[0];

          if (ongoingId && !restored.some((x) => x.endedAt === null)) {
            setSessions(openSession(restored, ongoingId));
          } else {
            setSessions(restored);
          }

          /* The record behind you. `summarise` is what turns a stored day
             into an entry, and it files nothing for a day where nothing
             finished — so an empty day is absent rather than a zero. */
          setHistory(
            past
              .map((row) => {
                // block_state holds status and completedAt only — the name and
                // colour live on the block itself, so they get resolved here.
                const done = Object.entries(row.block_state ?? {})
                  .filter(([, v]) => v?.status === "done")
                  .map(([id, v]) => {
                    const b = shapeById.get(id);
                    return {
                      id,
                      ...v,
                      // a block deleted since still happened, so it keeps its place
                      name: b?.name ?? "A block",
                      bg: b?.bg ?? "#ECECEC",
                      ink: b?.ink ?? "#2b2b2b",
                    };
                  });
                const things = Object.values(row.task_state ?? {}).filter(
                  (v) => v === "done",
                ).length;
                if (done.length === 0 && things === 0) return null;
                return {
                  date: row.stamp,
                  label: labelFor(row.stamp),
                  blocks: done,
                  tasks: things,
                  minutes: 0,
                  journal: row.journal ?? {},
                  /* Null means midnight filed it and nobody has looked. That
                     is the day the morning recap is for. */
                  endedAt: row.ended_at ? Date.parse(row.ended_at) : null,
                };
              })
              .filter(Boolean),
          );
        }
      } catch (err) {
        /* Offline, the session expired, or the schema is behind the code — a
           migration that has not been run yet fails exactly here. Nothing
           useful to say and nothing for anyone to do about it from here, but
           the app must not conclude the account is empty. */
        if (alive) setLoadFailed(true);
        console.warn("[milo] could not load your blocks", err);
      } finally {
        if (alive) setHydrated(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, [attempt]);

  useEffect(() => {
    if (!hydrated || !userId || !profile) return;
    queueWrite("profile", () => saveProfile(userId, { ...profile, restMinutes }));
  }, [hydrated, userId, profile, restMinutes]);

  /* The day, upserted to its own row. Queued, because a day changes on every
     tick of a checkbox and none of the intermediate states matter — only
     where it settles.

     NOTHING GOES TO localStorage. That was the whole point. */
  useEffect(() => {
    /* A FAILED READ MUST NEVER PRODUCE A WRITE.

       This is the one that actually destroys data, and it is not theoretical:
       `hydrated` turns true in a `finally`, so it is true after a load that
       threw. State is then empty — not because the day is empty, but because
       nothing could be read — and this effect happily upserts that emptiness
       over the real row. Everything done today, overwritten by a query error.

       The optimistic write path assumes memory holds the truth. That is only
       true once the truth has been loaded. */
    if (!hydrated || !userId || loadFailed) return;

    const stamp = stampToday();
    queueWrite(`day:${stamp}`, () =>
      saveDay(userId, stamp, {
        startedAt: day.startedAt,
        endedAt: day.endedAt,
        blockState: Object.fromEntries(
          blocks
            .filter((b) => b.status && b.status !== "todo")
            .map((b) => [
              b.id,
              { status: b.status, completedAt: b.completedAt ?? null },
            ]),
        ),
        taskState: Object.fromEntries(
          tasks
            .filter((t) => t.status && t.status !== "todo")
            .map((t) => [t.id, t.status]),
        ),
        dropped: blocks.filter((b) => b.dropped).map((b) => b.id),
        journal,
        pause,
      }),
    );
  }, [hydrated, loadFailed, userId, blocks, tasks, day, journal, pause]);

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

  /* Sessions reach the database from HERE, not from the eight places that
     open and close them. Diffing the log against what was last sent is less
     fragile than remembering a write at every transition, and it means a
     new transition added later is covered without anyone noticing.

     Rows are immutable once closed, so only two things ever happen: a new
     interval is inserted, or an open one gets its end. */
  const sentSessions = useRef(new Map());
  useEffect(() => {
    /* A FAILED READ MUST NEVER PRODUCE A WRITE.

       This is the one that actually destroys data, and it is not theoretical:
       `hydrated` turns true in a `finally`, so it is true after a load that
       threw. State is then empty — not because the day is empty, but because
       nothing could be read — and this effect happily upserts that emptiness
       over the real row. Everything done today, overwritten by a query error.

       The optimistic write path assumes memory holds the truth. That is only
       true once the truth has been loaded. */
    if (!hydrated || !userId || loadFailed) return;

    for (const x of sessions) {
      const sent = sentSessions.current.get(x.id);

      if (sent === undefined) {
        sentSessions.current.set(x.id, x.endedAt);
        /* Close anything the server has open before opening this one. A tab
           that died leaves a row this client never loaded, and the partial
           unique index would refuse the insert with 23505. */
        writeNow(`session:${x.id}`, async () => {
          if (x.endedAt === null) await closeAnyOpen(x.startedAt);
          const res = await openSessionRow(userId, x);
          if (!res.error && x.endedAt !== null) {
            return closeSessionRow(x);
          }
          return res;
        });
        continue;
      }

      if (sent === null && x.endedAt !== null) {
        sentSessions.current.set(x.id, x.endedAt);
        writeNow(`session:${x.id}`, () => closeSessionRow(x));
      }
    }
  }, [hydrated, loadFailed, userId, sessions]);

  useEffect(() => () => clearTimeout(moodTimer.current), []);

  // What the setup wizard hands back. Blocks become the real ones, tasks
  // start empty — a new day has nothing in it yet, and that is fine.
  /* What the setup wizard hands back. This is the ONLY place blocks come
     into existence, which is what makes an empty account genuinely empty.

     Written immediately, not queued: everything after this is an update
     against these ids, and an update to a row that was never inserted
     succeeds and changes nothing. */
  const completeSetup = useCallback(
    ({ year, month, blocks: chosen, tasksByBlock = {}, keepExisting = false }) => {
      /* The month carries the calendar month it was chosen in. That stamp is
         the only thing that tells the review a month has turned over. */
      const now = new Date();
      setProfile({
        year,
        month: {
          ...month,
          stamp: month.stamp ?? `${now.getFullYear()}-${now.getMonth() + 1}`,
        },
      });

      const rows = chosen.map((b, i) => ({
        ...b,
        id: crypto.randomUUID(),
        seedId: b.id,
        name: b.name.endsWith(" Block") ? b.name : `${b.name} Block`,
        status: keepExisting ? "todo" : i === 0 ? "ongoing" : "todo",
      }));

      /* No duration. Nobody was asked, so Milo does not answer for them —
         an invented 15 was being shown back as 'Takes: 15 minutes' as
         though it were the user's own estimate. */
      const taskRows = rows.flatMap((b) =>
        (tasksByBlock[b.seedId] ?? []).map((name) => ({
          id: crypto.randomUUID(),
          blockId: b.id,
          name,
          reason: "",
          note: "",
          minutes: null,
          status: "todo",
          kind: "routine",
          days: [],
          steps: [],
        })),
      );

      /* keepExisting is the month review adding to a shelf that already has
         things on it. Setup itself replaces, because there is nothing to
         replace. */
      setBlocks((prev) =>
        keepExisting
          ? [...prev, ...rows.map(({ seedId, ...b }) => b)]
          : rows.map(({ seedId, ...b }) => b),
      );
      setTasks((prev) => (keepExisting ? [...prev, ...taskRows] : taskRows));

      if (userId) {
        // keepExisting appends, so the write has to start after what is there
        writeNow("setup:blocks", () =>
          createBlocks(
            userId,
            rows.map(({ seedId, ...b }) => b),
            keepExisting ? blocks.length : 0,
          ),
        );
        if (taskRows.length) {
          writeNow("setup:tasks", () => createTasks(userId, taskRows));
        }
      }
    },
    [userId, blocks],
  );
  /* Finishing a task is not the only way a block can become finished.

     Rescheduling the rest of them does it too: three tasks, one done, move the
     other two to the weekend and your Deep Work IS over for today — the block
     should say so the moment you make the change, not sit there ongoing with
     an empty board. Deleting the last unfinished task is the same story.

     It runs backwards as well. Pull a task back onto today and a block that
     had gone done reopens, because a finished block with unfinished work in it
     is a lie in the other direction.

     Never touches a dropped block — setting one aside was a decision about
     today and this has no business reversing it. */
  const holdMood = useCallback((mood, ms) => {
    setMiloMood(mood);
    clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setMiloMood(undefined), ms);
  }, []);

  const reconcile = useCallback(
    (list) => {
      /* Worked out BEFORE the state changes, because afterwards there is no
         way to tell a block that just finished from one that already had. */
      const finishing = blocks.filter(
        (b) =>
          !b.dropped &&
          !b.archived &&
          b.status !== "done" &&
          blockFinished(list, b.id),
      );

      setBlocks((prev) =>
        prev.map((b) => {
          if (b.dropped || b.archived) return b;
          const mine = workToday(list, b.id);
          if (mine.length === 0) return b;

          const all = mine.every((t) => t.status === "done");
          if (all && b.status !== "done")
            return { ...b, status: "done", completedAt: Date.now() };

          /* Reopening returns it to the line, not to the clock — restarting a
             timer nobody asked for would invent time. */
          if (!all && b.status === "done")
            return { ...b, status: "todo", completedAt: undefined };

          return b;
        }),
      );

      if (finishing.length === 0) return;

      /* A block finished. It does not matter that the last move was moving two
         tasks to the weekend rather than ticking one — THE RULE in sound.js is
         that a sound fires for something that HAPPENED, and your Deep Work
         being over for today happened.

         Nothing plays when a block REOPENS. That is a correction, not an
         event, and a noise for it would be Milo marking an absence. */
      playBlock();
      holdMood("proud", 4000);

      /* The clock and the rest only follow a block you were actually IN. Finish
         a block you were not running — by rescheduling the rest of its tasks —
         and there is no session to close and no rest to earn, because you were
         not working when it happened. */
      const running = finishing.find((b) => b.status === "ongoing");
      if (!running) return;

      setFocusLocked(false);
      setSessions((log) => closeSessions(log));
      if (restMinutes > 0 && moreToCome(blocks, running.id)) {
        setRest({
          until: Date.now() + restMinutes * 60000,
          blockName: running.name,
        });
      }
    },
    [blocks, holdMood, restMinutes],
  );

  /* Each of these changes the SHAPE, so each one reaches the database.
     Queued and keyed by id, so holding a key down is one write. */
  // next is built outside setTasks: an updater has to be pure, and React runs
  // it twice in development — reconcile in there fired the block sound twice.
  const setTaskDays = useCallback(
    (id, days) => {
      const next = tasks.map((t) => (t.id === id ? { ...t, days } : t));
      const task = next.find((t) => t.id === id);
      if (task) queueWrite(`task:${id}`, () => saveTask(task), { wait: 300 });
      setTasks(next);
      reconcile(next);
    },
    [tasks, reconcile],
  );

  /* routine comes back every day it is scheduled for; once leaves the block
     when it is done. Without this a finished project reappears tomorrow,
     which is the app forgetting something you will not forget. */
  const setTaskKind = useCallback((id, kind) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, kind } : t));
      const task = next.find((t) => t.id === id);
      if (task) queueWrite(`task:${id}`, () => saveTask(task), { wait: 300 });
      return next;
    });
  }, []);

  const setTaskMinutes = useCallback((id, minutes) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, minutes } : t));
      const task = next.find((t) => t.id === id);
      if (task) queueWrite(`task:${id}`, () => saveTask(task), { wait: 400 });
      return next;
    });
  }, []);

  const setTaskNote = useCallback((id, note) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, note } : t));
      const task = next.find((t) => t.id === id);
      // typing, so it waits for you to stop
      if (task) queueWrite(`task:${id}`, () => saveTask(task));
      return next;
    });
  }, []);

  const addStep = useCallback(
    (taskId, name) => {
    const clean = name.trim();
    if (!clean) return;
    const step = { id: crypto.randomUUID(), name: clean, done: false };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              steps: [...(t.steps ?? []), step],
            }
          : t,
      ),
    );

    // immediate: everything after this is an update against this id
    if (userId) {
      const at = (tasks.find((t) => t.id === taskId)?.steps ?? []).length;
      writeNow(`step:${step.id}`, () => createStep(userId, taskId, step, at));
    }
    },
    [userId, tasks],
  );

  const toggleStep = useCallback((taskId, stepId) => {
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              steps: (t.steps ?? []).map((x) =>
                x.id === stepId ? { ...x, done: !x.done } : x,
              ),
            }
          : t,
      );
      const step = next
        .find((t) => t.id === taskId)
        ?.steps.find((x) => x.id === stepId);
      // a tick is something you would notice losing
      if (step) writeNow(`step:${stepId}`, () => saveStep(step));
      return next;
    });
  }, []);

  // Takes the finished order, because the list reflows live while you drag.
  const reorderSteps = useCallback((taskId, orderedIds) => {
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
  }, []);

  const removeStep = useCallback((taskId, stepId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, steps: (t.steps ?? []).filter((x) => x.id !== stepId) }
          : t,
      ),
    );
    writeNow(`step:${stepId}`, () => deleteStep(stepId));
  }, []);

  /* Adding a task any day is allowed; adding a BLOCK is not. The month
     decides the containers, the day fills them — that is the whole rule, and
     it is what keeps Milo from becoming an infinite backlog. */
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
    [userId, tasks, reconcile],
  );

  const removeTask = useCallback(
    (id) => {
      const next = tasks.filter((t) => t.id !== id);
      setTasks(next);
      reconcile(next);
      writeNow(`task:${id}`, () => deleteTask(id));
    },
    [tasks, reconcile],
  );

  /* Pausing happens the instant you press it — there is no dialog in front
     of it and no note to fill in first.

     That is deliberate. You pause because something is pulling you away
     NOW; a form at that moment is a form you fill in while someone waits at
     the door, and the clock would keep running until you finished typing.
     So the clock stops here, and the note is asked for on the screen you
     land on — write it, or walk away and don't. Both are fine. */
  const pauseDay = useCallback(() => {
    // a paused day accrues nothing, and that is not a penalty — it is the truth
    setSessions((log) => closeSessions(log));

    /* Remember the TASK as well as the block. POSITIONING commitment 8 is
       that switching is free and leaving is never loss — which has to include
       coming back to the same line, not just the same room. Resuming onto the
       block alone put the clock on nothing in particular and dropped the
       running marker off the card you were actually on. */
    const current = blocks.find((b) => b.status === "ongoing");
    setPause({
      pausedAt: Date.now(),
      blockId: current?.id ?? null,
      taskId: sessions.find((x) => x.endedAt === null)?.taskId ?? null,
      note: "",
    });
    setBlocks((prev) =>
      prev.map((b) => (b.status === "ongoing" ? { ...b, status: "paused" } : b)),
    );
    setRest(null);
  }, [blocks, sessions]);

  /* The note you leave yourself. Editable the whole time you are paused and
     still there when you get back, because the useful thought often arrives
     after you have already stood up.

     Masicampo & Baumeister (2011): an unfinished task keeps intruding on
     attention, and MAKING A PLAN FOR IT stops the intrusion — not finishing
     it. So this is not a convenience. It is the thing that lets you actually
     leave, which is the whole point of a pause that isn't a punishment. */
  const setPauseNote = useCallback((note) => {
    setPause((p) => (p === null ? p : { ...p, note }));
  }, []);

  const resumeDay = useCallback(() => {
    if (pause?.blockId) {
      // back to the same line, not just the same room
      setSessions((log) =>
        openSession(log, pause.blockId, pause.taskId ?? null),
      );
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === pause.blockId ? { ...b, status: "ongoing" } : b,
        ),
      );
      /* The same cue as locking in, because it is the same event: you are
         going back in. THE RULE in sound.js is that a sound only fires for
         something that HAPPENED — coming back happened. Nothing plays when
         you pause, which would be a noise for leaving. */
      playLock();
      // going back in reopens a closed day, the same as starting a block
      setDay((d) => (d.endedAt ? { ...d, endedAt: null } : d));
    }
    setPause(null);
  }, [pause]);

  /* Closing the day ON PURPOSE. The timestamp is the difference between a day
     you finished and a day that merely stopped — and it is what tells the next
     morning whether you have already seen what this one held. */
  const endDay = useCallback(() => {
    // an ended day accrues nothing: close the open interval, as a pause does
    setSessions((log) => closeSessions(log));
    setBlocks((prev) =>
      prev.map((b) => (b.status === "ongoing" ? { ...b, status: "paused" } : b)),
    );
    setDay((d) => ({ ...d, endedAt: Date.now() }));
    setRest(null);
  }, []);

  /* Wipes the day and hands back the same blocks, untouched. Runs on its own
     when the calendar date changes, and by hand from the closing screen.

     What it leaves behind is a record of what got DONE, and nothing else. A
     finished day and an abandoned one still reset to exactly the same place;
     the difference is that the finished one has something worth keeping. A
     day with nothing in it files nothing, so it can never accumulate. */
  /* `forStamp` is which day is being FILED, and it is not always today.

     Called from the closing screen it is today, because you are closing the
     day you are in. Called by the midnight roll it is yesterday — the clock
     has already turned over, so defaulting to stampToday() would file
     Tuesday's work under Wednesday's date. */
  const newDay = useCallback(
    (forStamp = stampToday(), log = sessions) => {
    const stamp = forStamp;
    /* `day.endedAt` is set by endDay() and only by endDay(), so a day closed
       through the closing screen files as read and a day midnight rolled files
       as unread. Same function, and the caller does not have to remember. */
    /* `log` rather than `sessions` because the midnight roll has to close the
       open interval BEFORE the day is summarised, and the closed list only
       exists in that caller's hand — setSessions has not committed yet. Read
       from state here and `(endedAt ?? now) - startedAt` would price the open
       interval up to the current moment, which is already tomorrow: a block
       left running overnight would file eleven hours against yesterday. */
    const entry = summarise(
      blocks,
      tasks,
      log,
      stamp,
      labelFor(stamp),
      day.endedAt ?? null,
    );
    if (entry) {
      setHistory((prev) => [
        { ...entry, journal },
        ...prev.filter((h) => h.date !== entry.date),
      ]);
    }

    /* THESE TWO WERE UNDEFINED. `freshBlocks` and `freshTasks` were referenced
       here and declared nowhere — they went out with the seed data and the
       references stayed, so every call to newDay() threw a ReferenceError and
       both ways out of a day were dead. A day genuinely could not end.

       Fresh means: the same shape you built, with today's result wiped off it.
       Blocks keep their name, colour and order and lose their status. That
       separation is the whole reason a new day is safe — resetting a day
       deletes nothing you shaped. */
    setBlocks(
      blocks.map((b) => ({
        ...b,
        status: "todo",
        completedAt: undefined,
        dropped: false,
      })),
    );

    /* A finished `once` task does not come back. The dialog has promised this
       since kind was added — "done is done, it leaves the block" — and nothing
       has ever read the field. Archived, never deleted: days store task ids,
       so deleting one rots every past day that mentions it. */
    const retiring = tasks.filter(
      (t) => t.kind === "once" && t.status === "done",
    );
    retiring.forEach((t) =>
      writeNow(`task:${t.id}`, () => archiveTask(t.id)),
    );

    const retired = new Set(retiring.map((t) => t.id));
    setTasks(
      tasks
        .filter((t) => !retired.has(t.id))
        .map((t) => ({ ...t, status: "todo" })),
    );
    /* Yesterday's intervals keep their own dated rows. Emptying this list
       drops them from memory, not from the record. */
    setSessions([]);
    sentSessions.current = new Map();
    setDay({ startedAt: null, endedAt: null });
    setJournal({ morning: "", pause: "", night: "" });
    setRest(null);
    setPause(null);
    setFocusLocked(false);
    },
    [blocks, tasks, sessions, day.endedAt, journal],
  );

  /* MIDNIGHT.

     Nothing used to watch the clock. newDay was reachable from two buttons
     and nowhere else, so a session left open ran straight through the night
     and kept counting — five and a half hours in one block, still 'ongoing',
     on a day that had been over since midnight.

     A poll, not a timeout to midnight. A timeout is the tidier idea and it is
     wrong here: laptops sleep, and a timer armed for 00:00 either fires hours
     late or not at all. Comparing the date every half minute self-corrects the
     moment the machine wakes up, and being a minute late to a midnight roll
     costs nothing.

     THIS NEVER ASKS. POSITIONING: an unended day simply ends. There is no
     'you forgot to close yesterday' — the day is filed, and what you get in
     the morning is a report, not a prompt. */
  const dayStamp = useRef(stampToday());

  /* The interval is armed ONCE. `newDay` changes identity whenever a task
     does, so listing it as a dependency tore the timer down and rebuilt it on
     every tick of a checkbox — a 30-second timer that keeps restarting is a
     timer that can simply never fire. The ref carries the live values in
     instead, and the effect stops caring when they change. */
  const latest = useRef({ sessions: [], newDay: null });
  // written after commit, not during render — the interval reads it, not React
  useEffect(() => {
    latest.current = { sessions, newDay };
  }, [sessions, newDay]);

  useEffect(() => {
    if (!hydrated) return;

    const check = () => {
      const now = stampToday();
      if (now === dayStamp.current) return;

      const closing = dayStamp.current;
      dayStamp.current = now;
      const { sessions: log, newDay: roll } = latest.current;

      /* Was anyone actually here when the clock turned over? The heartbeat
         already answers this for crash recovery, and the same answer decides
         whether the block carries on into the new day.

         Awake at 00:30 and still working: the interval closes at 23:59:59 on
         the day it belongs to and reopens on the new one, so the log keeps its
         one-row-one-date rule without interrupting you. Asleep with the tab
         open: it closes at the last moment anyone was seen and reopens
         nothing, because the hours after that were not work. */
      let seen = 0;
      try {
        seen = Number(window.localStorage.getItem(SEEN_KEY)) || 0;
      } catch {}
      const awake = Date.now() - seen < STALE;

      const open = log.find((x) => x.endedAt === null);
      const carry = awake && open ? { blockId: open.blockId, taskId: open.taskId } : null;

      /* min, not max. Asleep, `seen` is the last moment anyone was observed —
         22:30, say — and taking the later of the two would hand you the ninety
         minutes after you walked away. The only case where seen runs past
         midnight is a tab that woke for a second, and an interval belonging to
         yesterday must not end tomorrow. */
      const closeAt = awake ? lastNight() : Math.min(seen, lastNight());
      const closed = closeSessions(log, closeAt);

      /* Straight at the database, not through the state diff. The mirror
         effect writes what CHANGED between renders, and newDay empties the
         list in this same batch — so the close would vanish before anything
         noticed it, leaving a row open forever and the partial unique index
         refusing every future clock. closeAnyOpen is exactly this repair. */
      writeNow(`sessions:midnight:${closing}`, () => closeAnyOpen(closeAt));
      setSessions(closed);

      // file it under the day it happened on, not the one we woke up in
      roll(closing, closed);

      if (carry) {
        setDay({ startedAt: Date.now(), endedAt: null });
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === carry.blockId ? { ...b, status: "ongoing" } : b,
          ),
        );
        setSessions((log) => openSession(log, carry.blockId, carry.taskId));
      }
    };

    const t = setInterval(check, 30000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", check);
    };
  }, [hydrated]);

  /* Yesterday, if nobody has looked at it.

     `endedAt` is null on a day midnight filed for you, and set on one you
     closed yourself — so this is exactly the set of days you have not seen.
     Dismissing it marks it ended: reading what a day held IS closing it, one
     day late. */
  const unseen = useMemo(
    () => history.find((h) => h.endedAt == null && h.date !== stampToday()) ?? null,
    [history],
  );

  const markSeen = useCallback((stamp) => {
    setHistory((prev) =>
      prev.map((h) => (h.date === stamp ? { ...h, endedAt: Date.now() } : h)),
    );
    writeNow(`day:${stamp}`, () => markDayEnded(stamp));
  }, []);

  const skipRest = useCallback(() => setRest(null), []);


  /* Starting one pauses whatever was running — the one-ongoing rule. Postgres
     will enforce it too (a unique partial index), but it has to hold here as
     well or the UI can show a state the database would refuse. */
  /* If a card is already sitting in In Progress, the clock belongs on it, not
     on the block. Without this, starting a block you had already put a task
     into left the task with no interval at all — no running pill, no elapsed,
     and spentOnTask stuck at zero however long you worked.

     Only when there is exactly one. TIME.md allows several cards in In
     Progress with one of them RUNNING, and if we cannot tell which, the
     honest answer is block time rather than a guess. */
  const resuming = useCallback(
    (blockId) => {
      const doing = tasks.filter(
        (t) => t.blockId === blockId && t.status === "doing" && onDay(t),
      );
      return doing.length === 1 ? doing[0].id : null;
    },
    [tasks],
  );

  const start = useCallback((id) => {
    // starting a block is starting the day — so it reopens a day you closed
    setDay((d) => (!d.startedAt ? { ...d, startedAt: Date.now() } : d.endedAt ? { ...d, endedAt: null } : d));
    setPause(null);
    setRest(null);

    /* Starting the block IS starting the clock — no separate arm step. A
       second ritual you can forget produces a day that didn't count, which is
       the artifact POSITIONING commitment 2 forbids.

       Read from `blocks` rather than from inside a setBlocks updater: an
       updater has to be pure, and React runs it twice in development, so
       nesting a setState in there opened two intervals per click. */
    const stopping = blocks.find((b) => b.id === id)?.status === "ongoing";
    setSessions((log) =>
      stopping ? closeSessions(log) : openSession(log, id, resuming(id)),
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
  }, [blocks, resuming]);

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
  /* A block is born on the MONTH page, never on the day. The month decides
     the containers and the day fills them — that is what keeps Milo from
     becoming an infinite backlog. */
  const addBlock = useCallback(
    (name) => {
      const clean = name.trim();
      if (!clean || !userId) return;

      // first colour nobody is using, so a new block never arrives as a twin
      const taken = new Set(blocks.map((b) => b.bg));
      const colour =
        BLOCK_COLOURS.find((c) => !taken.has(c.bg)) ??
        BLOCK_COLOURS[blocks.length % BLOCK_COLOURS.length];

      const block = {
        id: crypto.randomUUID(),
        name: clean,
        bg: colour.bg,
        ink: colour.ink,
        status: "todo",
        archived: false,
      };

      setBlocks((prev) => [...prev, block]);
      writeNow(`block:${block.id}`, () =>
        createBlocks(userId, [block], blocks.length),
      );
    },
    [userId, blocks],
  );

  // Renaming and recolouring change the SHAPE, so they outlive the day.
  const editBlock = useCallback(
    (id, patch) => {
      const next = blocks.map((b) => (b.id === id ? { ...b, ...patch } : b));
      setBlocks(next);
      const block = next.find((b) => b.id === id);
      // debounced: renaming is typing, and every keystroke is not a write
      if (block) queueWrite(`block:${id}`, () => saveBlock(block), { wait: 500 });
    },
    [blocks],
  );

  /* Gone for good, and it takes its tasks with it — the foreign key cascades.
     Past days keep working: they store ids, and history resolves a missing one
     to a neutral chip rather than dropping what you did that day. */
  const removeBlock = useCallback((id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setTasks((prev) => prev.filter((t) => t.blockId !== id));
    writeNow(`block:${id}`, () => deleteBlock(id));
  }, []);

  const archiveBlock = useCallback((id) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, archived: true, status: b.status === "ongoing" ? "todo" : b.status }
          : b,
      ),
    );
    // archived is shape, not today — a shelved block is shelved tomorrow too
    const block = blocks.find((x) => x.id === id);
    if (block) {
      writeNow(`block:${id}`, () => saveBlock({ ...block, archived: true }));
    }
  }, [blocks]);

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

  const restoreBlock = useCallback(
    (id) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, archived: false } : b)),
      );
      const block = blocks.find((b) => b.id === id);
      if (block) {
        writeNow(`block:${id}`, () => saveBlock({ ...block, archived: false }));
      }
    },
    [blocks],
  );

  /* Tasks inside ONE block. The order is the shape of the block, not a fact
     about today, so it lives on the task row and survives the daily reset —
     drag them into the order you want to work them and tomorrow starts that
     way too.

     Written straight away rather than queued. Reordering blocks debounces
     because dragging across four positions fires four times, but this fires
     once per drop, and losing the arrangement you just made is the kind of
     small betrayal that stops people trusting an app with anything. */
  const reorderTasks = useCallback(
    (blockId, orderedIds) => {
      setTasks((prev) => {
        const mine = prev.filter((t) => t.blockId === blockId);

        /* THE WHOLE ORDER, not a from/to pair. The list reflows live while
           you drag, so by the time you let go the arrangement on screen is
           already the answer — asking the caller to re-derive it from two
           ids means the screen and the write can disagree about what you
           just did. */
        const byId = new Map(mine.map((t) => [t.id, t]));
        const ordered = orderedIds.map((id) => byId.get(id)).filter(Boolean);
        if (ordered.length !== mine.length) return prev;

        writeNow(`tasks:order:${blockId}`, () => saveTaskOrder(ordered));

        /* Rebuilt in place: the block's tasks come back in the new order,
           every other block's tasks stay exactly where they were in the
           array. Concatenating would silently regroup the whole list. */
        const queue = [...ordered];
        return prev.map((t) => (t.blockId === blockId ? queue.shift() : t));
      });
    },
    [],
  );

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

  /* The order is the one you dragged them into, so it is written. Queued
     rather than immediate: dragging a card across four positions fires four
     times and only the last arrangement is true. */
  useEffect(() => {
    if (!hydrated || !userId || blocks.length === 0) return;
    queueWrite("blocks:order", () => saveOrder(blocks.filter((b) => !b.archived)), {
      wait: 1200,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks.map((b) => b.id).join(",")]);

  const startAndLead = useCallback((id) => {
    // starting a block is starting the day — so it reopens a day you closed
    setDay((d) => (!d.startedAt ? { ...d, startedAt: Date.now() } : d.endedAt ? { ...d, endedAt: null } : d));
    setPause(null);
    setRest(null);
    setSessions((log) => openSession(log, id, resuming(id)));
    setBlocks((prev) => {
      const target = prev.find((b) => b.id === id);
      if (!target) return prev;
      const others = prev
        .filter((b) => b.id !== id)
        .map((b) => (b.status === "ongoing" ? { ...b, status: "paused" } : b));
      return [{ ...target, status: "ongoing" }, ...others];
    });
  }, [resuming]);

  const setTaskStatus = useCallback(
    (taskId, nextStatus) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === nextStatus) return;

      const next = tasks.map((t) =>
        t.id === taskId ? { ...t, status: nextStatus } : t,
      );
      setTasks(next);

      /* THE CLOCK ONLY MOVES INSIDE A BLOCK THAT IS RUNNING.

         Ticking used to open an interval whatever the block was doing, so
         marking something done in a stopped block started a clock on it —
         which is how a block ended up marked Running with hours of nothing.

         Ticking itself stays allowed. TIME.md already has done tasks with no
         interval: a quick task is a one-line row that never enters In
         Progress, and its time is block time. A done with no interval is
         fine; a clock that nobody started is not. */
      const live = blocks.find((b) => b.id === task.blockId)?.status === "ongoing";

      if (nextStatus !== "done") {
        run.current = 0;
        // picking something up is worth a reaction too, just a quieter one:
        // the face only, no toast — a toast on every drag would be noise
        if (nextStatus === "doing") holdMood("proud", 2500);

        /* In Progress can hold several cards; exactly one is RUNNING. Starting
           another moves the marker and nothing else — the previous card keeps
           its place and its time. Same mechanic as blocks, one level down, so
           there is no new rule anyone can break. */
        if (live && nextStatus === "doing") {
          setSessions((log) => openSession(log, task.blockId, taskId));
        } else if (live && task.status === "doing") {
          // back to To Do: stay in the block, just not on this
          setSessions((log) => openSession(log, task.blockId));
        }

        /* The other direction. Pull a task back out of Done and the block it
           belongs to is no longer finished — it used to stay marked done with
           unfinished work sitting inside it. */
        reconcile(next);
        return;
      }

      run.current += 1;
      // done: the clock goes back to the block, if the block has one
      if (live) setSessions((log) => openSession(log, task.blockId));
      const blockComplete = blockFinished(next, task.blockId);

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

        /* 0 means NEVER, and never has to mean no timer at all — a rest of
           zero minutes would set one that expires the instant it is created,
           so turning the nudge off would make it fire immediately. That is the
           opposite of what commitment 9 promises. */
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
        run: run.current,
      });

      holdMood(mood, 4000);
    },
    [tasks, blocks, holdMood, restMinutes, reconcile],
  );

  const value = useMemo(() => {
    const blockById = Object.fromEntries(blocks.map((b) => [b.id, b]));
    const inPlay = blocks.filter((b) => !b.archived);
    const live = inPlay.filter((b) => !b.dropped);
    const droppedToday = inPlay.filter((b) => b.dropped);
    const archived = blocks.filter((b) => b.archived);

    // counts per block, derived — never stored, so they can't drift
    const countsFor = (blockId) => {
      // today's, so the lineup's count matches the board underneath it
      const mine = workToday(tasks, blockId);
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
      addBlock,
      editBlock,
      removeBlock,
      archiveBlock,
      restoreBlock,
      dropBlock,
      undropBlock,
      toggleFocusLock,
      reorderBlocks,
      reorderTasks,
      setTaskStatus,
      countsFor,
      addTask,
      removeTask,
      setTaskDays,
      setTaskKind,
      setTaskMinutes,
      setTaskNote,
      addStep,
      toggleStep,
      reorderSteps,
      removeStep,
      day,
      journal,
      setJournal,
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
      loadFailed,
      retry,
      endDay,
      newDay,
      unseen,
      markSeen,
      rest,
      skipRest,
      paused,
      /* The whole object, not just the flag — the screen you land on needs
         to say WHERE you were and WHEN, and read back the note. */
      pause,
      setPauseNote,
      pauseDay,
      resumeDay,
      restMinutes,
      setRestMinutes,
      checkInMinutes,
      setCheckInMinutes,
      /* THE SMALL-SURFACE CONTRACT.

         Everything a widget, a lock screen or a watch face needs, in one
         plain object. Those surfaces cannot run app logic — they render a
         payload someone else prepared — so this is that payload, and the
         in-app check-in reads it too. One shape, so a widget can never drift
         from what the app is showing.

         WHAT IS DELIBERATELY ABSENT, because a home screen is the one place
         you cannot look away from:
           - no count of what is not done
           - no streak, no percentage, no target
           - nothing for a badge. An iOS badge is a red number counting
             things you have not done, which is the exact artifact
             POSITIONING exists to refuse. Milo must never set one. */
      /* `now` is required rather than defaulted. A `= Date.now()` default
         only evaluates on call, but it reads as an impure call sitting in
         render — and every caller has a ticking clock already. */
      snapshot: (now) => {
        const runningBlock = live.find((b) => b.status === "ongoing") ?? null;
        const queue = live.filter((b) => b.status !== "done");
        const at = runningBlock
          ? queue.findIndex((b) => b.id === runningBlock.id)
          : -1;

        return {
          // what is happening
          running: runningBlock
            ? {
                id: runningBlock.id,
                name: runningBlock.name,
                bg: runningBlock.bg,
                ink: runningBlock.ink,
                elapsedMs: spentOn(sessions, (x) => x.blockId === runningBlock.id, now),
              }
            : null,

          // your own order, read back — not a suggestion
          next: at >= 0 ? (queue[at + 1] ?? null) : (queue[0] ?? null),

          // the running block's tasks for today, in board order
          tasks: runningBlock
            ? tasks
                .filter((t) => t.blockId === runningBlock.id)
                .map(({ id, name, status }) => ({ id, name, status }))
            : [],

          // counts up, always
          doneToday: blocks.filter((b) => b.status === "done").length,
          spentMs: spentOn(sessions, () => true, now),
        };
      },

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
      setProfile,
      completeSetup,
      ongoing: ongoingBlock
        ? { ...ongoingBlock, ...countsFor(ongoingBlock.id) }
        : null,
    };
  }, [hydrated, loadFailed, retry, blocks, tasks, start, startAndLead, reorderBlocks, reorderTasks, addBlock, editBlock, removeBlock, focusLocked, toggleFocusLock, archiveBlock, restoreBlock, dropBlock, undropBlock, setTaskStatus, miloMood, profile, setProfile, completeSetup, addTask, removeTask, setTaskDays, setTaskKind, setTaskMinutes, setTaskNote, addStep, toggleStep, reorderSteps, removeStep, day, journal, history, sessions, endDay, newDay, unseen, markSeen, rest, skipRest, restMinutes, checkInMinutes, paused, pause, setPauseNote, pauseDay, resumeDay]);

  return <BlocksContext.Provider value={value}>{children}</BlocksContext.Provider>;
}

export function useBlocks() {
  const ctx = useContext(BlocksContext);
  if (!ctx) throw new Error("useBlocks must be used inside <BlocksProvider>");
  return ctx;
}
