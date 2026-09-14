"use client";

/* The board. Columns are STATUS — To Do / In Progress / Done — and cards are
 * pooled from every block, not grouped by block. The block shows as a coloured
 * spine on the card instead of as a column, which is what PRODUCT.md asks for.
 *
 * TWO SHAPES OF TASK. "Drink water" and "write the chapter" are not the same
 * kind of thing, and making both walk through In Progress turns the small one
 * into paperwork:
 *
 *   - a MOMENT (<= QUICK_MINUTES) renders as a row in a to-do list. One tap and
 *     it's done. It never enters In Progress, because it has no middle.
 *   - a SESSION renders as a draggable card, because a long thing genuinely gets
 *     started, interrupted and picked back up — the same reason blocks pause.
 *
 * Every card carries a tick too, so dragging stops being the only way to finish
 * something and becomes what you do when you want to PARK something.
 *
 * In Progress only exists when there is a session in play. On a day of small
 * things it would be an empty column asking to be filled.
 *
 * Click a card for its details. Dragging needs 10px of movement before it
 * starts, so a click never becomes a drag by accident.
 */

import { useState } from "react";
import { Check, Clock, ListChecks, Plus, X } from "lucide-react";
import { CircleCheckIcon, CircleDot, CircleIcon } from "lucide-react";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/reui/kanban";
import { Badge } from "@/components/reui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import { spent, useNow } from "@/lib/time";
import { DAYS, onDay } from "@/lib/days";
import { IconInput } from "@/components/ui/icon-input";
import { BlockChip, COLUMNS, Tick, isQuick } from "./task-bits";
import { TaskSheet } from "./task-sheet";
import { useBlocks } from "./blocks-provider";
import { PausedPanel } from "./paused-panel";
import { DayComplete } from "./day-complete";
import { DailyReflection } from "./daily-reflection";
import { TaskRings } from "./task-rings";

// Module scope, so the array identity never changes between renders.
const DRAG_BOUNDS = [restrictToFirstScrollableAncestor];

/* Said as words. A numeral in the middle of the screen reads like a score,
   and a score implies a target you could have missed. */
const NUMBER = [
  "No",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
];

/* Warms up as the day fills, and never mentions what is left. The line for
   one block is as pleased as the line for five — showing up once is the
   whole thing Milo is here to notice. */
const CHEER = [
  "Whenever you’re ready.",
  "You’re on the board.",
  "You’re on fire.",
  "Three deep. That’s a real day.",
  "Look at you go.",
];

/* One drawing per size of day, indexed by blocks done. All one file for now;
   drop new art in web/public and change the entry — the panel picks it up. */
const ART = [
  "/start.svg",
  "/motiv.svg",
  "/motiv.svg",
  "/motiv.svg",
  "/motiv.svg",
];

/* A moment: one line, one tap. This is the to-do list hiding inside the board,
   and it is deliberately not draggable — there is nowhere for it to go. */
function QuickRow({ task, onToggle, onOpen }) {
  const done = task.status === "done";
  return (
    <div className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-foreground/[0.03]">
      <Tick done={done} onToggle={onToggle} />
      <button
        type="button"
        onClick={() => onOpen(task)}
        className={`min-w-0 flex-1 cursor-pointer truncate text-left text-sm ${
          done ? "text-foreground/35 line-through" : ""
        }`}
      >
        {task.name}
      </button>
    </div>
  );
}

function TaskCard({ task, asHandle, isOverlay, onOpen, onToggle, isRunning, elapsed }) {
  const done = task.status === "done";

  /* A COUNT, not the list. The tickable list was here for one build and came
     straight back out: the detail dialog already owns the steps, so putting
     working checkboxes on the card meant two places to do the same thing and
     a card that grew taller the more you thought about a task.

     `2/5` says the one thing the card needs to say — this has parts, and you
     are somewhere in them. Tap it for the parts. */
  const steps = task.steps ?? [];
  const doneSteps = steps.filter((x) => x.done).length;
  const allSteps = steps.length > 0 && doneSteps === steps.length;

  /* The bottom row is not always there. It used to be, because the block chip
     was always in it — with the chip gone, a task with no estimate, no steps
     and no recorded time has nothing to put on that line, and an empty row is
     just a gap under the title. */
  const hasMeta = task.minutes != null || isRunning || Boolean(elapsed);
  const content = (
    /* White, with a thin grey border all the way round and the lift under it.

       The block's colour was tried here — spine and wash — and it was too
       much: a column of tinted cards becomes a colour field you read past
       rather than through. The border is what gives the card an edge; the
       lift gives it a side.

       There is no block chip either, for the same reason one level up. The
       board only ever shows the RUNNING block's tasks, so the chip put the
       same word on every card, under a column header, under a bar already
       naming the block. Three times is not reinforcement, it is noise. It
       earned its place back when the board pooled cards from every block. */
    <Card
      className="milo-lift cursor-pointer border border-foreground/10 bg-card"
      style={{ "--lift": "var(--card-lift)" }}
    >
      <CardContent
        onClick={() => onOpen?.(task)}
        className="flex flex-col gap-2 py-3"
      >
        <div className="flex items-start gap-2">
          {onToggle && <Tick done={done} onToggle={onToggle} className="mt-0.5 size-5" />}
          <span
            className={`min-w-0 flex-1 line-clamp-2 break-words text-sm ${done ? "text-foreground/40 line-through" : ""}`}
          >
            {task.name}
          </span>

          {/* `2/5`, in the corner — a position in a list you wrote, not a score.

              It sits up here rather than in the bottom row because it belongs
              to the TASK, the way the title does, while everything down there
              belongs to today: an estimate, a clock, time spent. Those change
              as the day goes; this changes as the work does.

              The accent colour, because the card is otherwise white and a grey
              badge on a white card at 11px is a whisper. Purple rather than
              the block's colour on purpose: a step count is not a fact about
              the block, and a tinted card was tried here and rejected — the
              badge is the one place colour earns its keep. It also matches the
              step field in the dialog, which is already purple.

              Filled when every step is ticked, tinted until then. Colour marks
              the finish; it never marks the shortfall — `0/5` is the same calm
              badge as `4/5`, because a list you have not started is not a
              failing, it is a list.

              The denominator is your own breakdown, so it can only count up
              toward a number you chose — no target anyone else set. That is
              what makes it a ratio Milo is allowed to show when '4 of 8
              blocks' would be forbidden.

              It still never rolls up. Ticking all five does not complete the
              task and the day does not count them — a task broken into five
              pieces is worth exactly what it was worth whole, or breaking
              things down would quietly make your day look emptier. */}
          {steps.length > 0 && (
            <span
              className={`pointer-events-none flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ${
                allSteps
                  ? "bg-[#5e17eb] text-white"
                  : "bg-[#5e17eb]/12 text-[#5e17eb]"
              }`}
            >
              <ListChecks className="size-3.5" />
              {doneSteps}/{steps.length}
            </span>
          )}
        </div>

        {/* The note, in the chip's old place. Two lines at most — it is a
            reminder of what this is, not the thing itself. The whole note is
            in the dialog, and the card is a card. */}
        {task.note && (
          <p className="line-clamp-2 break-words pl-7 text-xs leading-relaxed text-foreground/45">
            {task.note}
          </p>
        )}

        {hasMeta && (
        <div className="flex items-center gap-2 pl-7">
          {/* Only if there is one. TIME.md: never put this and the elapsed
              figure in the same row — people underestimate their own tasks as
              a rule, so the delta would show a shortfall on most tasks on
              most days. */}
          {task.minutes != null && (
            <span className="pointer-events-none flex items-center gap-1 text-[11px] text-foreground/35">
              <Clock className="size-3" />
              {task.minutes}m
            </span>
          )}



          {/* Time spent is a FACT, not a live readout. It showed only while
              the clock was on the card, so pausing the day made half an hour
              of work vanish from the screen — the record had it, the card just
              refused to say so.

              Running gets the dark pill and the pulse. Not running keeps the
              number, quietly. */}
          {isRunning ? (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[11px] text-background tabular-nums">
              <span className="size-1.5 animate-pulse rounded-full bg-card" />
              {elapsed ?? "Running"}
            </span>
          ) : (
            elapsed && (
              <span className="ml-auto text-[11px] text-foreground/45 tabular-nums">
                {elapsed}
              </span>
            )
          )}
        </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <KanbanItem value={task.id}>
      {asHandle && !isOverlay ? (
        <KanbanItemHandle>{content}</KanbanItemHandle>
      ) : (
        content
      )}
    </KanbanItem>
  );
}

/* Held while localStorage is read. The board has two very different shapes
   — columns when something is running, a panel when nothing is — and which
   one you get depends on stored state. So this commits to neither: one
   quiet rounded field the size of the region. */
function BoardSkeleton() {
  return (
    <div className="h-full min-h-48 animate-pulse rounded-2xl bg-foreground/[0.03]" />
  );
}

export function TaskBoard() {
  const { tasks, blocks, blockById, countsFor, setTaskStatus, ongoing, startAndLead, hydrated, runningTaskId, spentOnTask, spentOnBlock, setTaskNote, setTaskMinutes, addStep, toggleStep, removeStep, setTaskDays, setTaskKind , paused, loadFailed, retry, day } =
    useBlocks();
  const [dropping, setDropping] = useState(false);
  /* Ticks whenever anything is running, not only when a TASK is — otherwise
     the numbers on the other cards freeze the moment you pause. */
  const now = useNow(Boolean(ongoing));

  /* Takes a block dragged out of the lineup. Starting it here pauses
     whatever was running and puts it at the head of the line. */
  const drop = {
    onDragOver: (e) => {
      if (!e.dataTransfer.types.includes("application/milo-block")) return;
      e.preventDefault();
      setDropping(true);
    },
    onDragLeave: () => setDropping(false),
    onDrop: (e) => {
      const id = e.dataTransfer.getData("application/milo-block");
      setDropping(false);
      if (!id) return;
      e.preventDefault();
      startAndLead(id);
    },
  };
  const [open, setOpen] = useState(null);
  const [stepDraft, setStepDraft] = useState("");

  /* Today's tasks only. A task scheduled for other days is ABSENT here, not
     greyed out — a dimmed row is still a row telling you what you are not
     doing today, and it isn't yours to do today. */
  const mine = ongoing
    ? tasks.filter((t) => t.blockId === ongoing.id && onDay(t))
    : [];

  // everything in the column, for the count on the header
  const all = {
    todo: mine.filter((t) => t.status === "todo"),
    doing: mine.filter((t) => t.status === "doing"),
    done: mine.filter((t) => t.status === "done"),
  };

  /* Only sessions are handed to dnd-kit. Moments aren't in the board's model at
     all, so there is no way to drag one and no way for a drop to move one. */
  const board = {
    todo: all.todo.filter((t) => !isQuick(t)),
    doing: all.doing.filter((t) => !isQuick(t)),
    done: all.done.filter((t) => !isQuick(t)),
  };

  const hasSessions = mine.some((t) => !isQuick(t));
  const shown = hasSessions ? ["todo", "doing", "done"] : ["todo", "done"];

  const toggle = (task) =>
    setTaskStatus(task.id, task.status === "done" ? "todo" : "done");

  // Applied live while dragging. The provider stays the single source of truth,
  // so this translates the board shape back into per-task statuses.
  const onValueChange = (next) => {
    for (const [status, items] of Object.entries(next)) {
      for (const item of items) {
        if (item.status !== status) setTaskStatus(item.id, status);
      }
    }
  };

  /* Fires once when a drag finishes, never during the hover preview — this is
     where the Supabase write goes once the schema exists. On failure, roll back
     with meta.previousValue (or better, refetch, so a newer drag isn't clobbered
     by a stale snapshot). Nothing to persist to yet, so it's a no-op. */
  const onValueCommit = (_next, _meta) => {};

  /* `open` is a snapshot taken when the dialog opened. Steps live on the
     real task, so read that back — otherwise ticking one changes state that
     nothing on screen is looking at. */
  const openTask = open ? (tasks.find((t) => t.id === open.id) ?? open) : null;

  /* Every step ticked, on a task that actually has steps.

     This does NOT complete the task. It offers. Steps never roll up — a task
     broken into six pieces has to be worth exactly what it was worth whole, or
     breaking things down would quietly make the day count differently. What
     the rule protects is the COUNTING, and an offer counts nothing.

     What it fixes is the dead end: you tick the last step, and until now the
     app said nothing and made you go find a second button to say the thing you
     had just finished saying. */
  const stepsAllDone =
    (openTask?.steps?.length ?? 0) > 0 &&
    openTask.steps.every((x) => x.done);
  const openBlock = open ? blockById[open.blockId] : null;

  if (!hydrated) return <BoardSkeleton />;

  /* Same rule as the lineup. 'Nothing running' next to a day that failed to
     load reads as a day that never happened. */
  if (loadFailed) {
    return (
      <div className="flex h-full min-h-48 flex-col items-center justify-center gap-4 rounded-2xl px-6 text-center">
        <p className="text-sm text-foreground/60">Couldn&rsquo;t reach today.</p>
        <p className="max-w-xs text-xs text-foreground/40">
          Your blocks, tasks and the time you&rsquo;ve put in are all still
          saved. This screen just couldn&rsquo;t read them.
        </p>
        <button
          type="button"
          onClick={retry}
          className="cursor-pointer rounded-xl bg-foreground px-4 py-2 text-xs text-background"
        >
          Try again
        </button>
      </div>
    );
  }

  /* Before the nothing-running check, because a paused day has nothing
     running either — whichever comes first is the screen you get, and while
     the day is paused the only thing worth saying is where you were. */
  // a closed day shows its reflection even if it was paused — the pause note stays stored
  if (paused && !day.endedAt) return <PausedPanel />;

  if (!ongoing) {
    /* Nothing running. Once the day has anything in it, this space stops
       being an empty state and starts reporting the day back: the count up
       top, and the finished blocks along the bottom in the order they were
       finished. Two lines, one above and one below — what's still ahead of
       you, and what's behind you. */
    const finished = blocks
      .filter((b) => b.status === "done")
      .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0));
    const n = finished.length;

    /* Every block still in play is done. Blocks set aside earlier don't
       count against this — setting one aside was the decision that it isn't
       today's, so a day of three out of five you chose is a whole day. */
    const complete = n > 0 && n === blocks.length;
    // a day you closed shows its reflection until rollover, finished or not
    const reflecting = complete || day.endedAt != null;

    return (
      <div
        {...drop}
        className={`flex h-full min-h-48 flex-col rounded-2xl transition-colors duration-200 ${
          dropping ? "bg-foreground/[0.04]" : ""
        }`}
      >
        <div
          className={`flex min-h-0 flex-1 flex-col gap-3 px-6 ${
            reflecting
              ? "w-full max-w-lg"
              : "items-center justify-center text-center"
          }`}
        >
          {!reflecting && (
            <img
              src={ART[Math.min(n, ART.length - 1)]}
              alt=""
              className="dark:rounded-2xl dark:bg-chip dark:p-1 size-44"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          {reflecting ? (
            <DailyReflection />
          ) : n > 0 ? (
            <>
              <h2 className="max-w-lg text-3xl">
                {NUMBER[n] ?? n} {n === 1 ? "block" : "blocks"} done today.{" "}
                <span className="text-foreground/45">
                  {CHEER[Math.min(n, CHEER.length - 1)]}
                </span>
              </h2>

              {/* An invitation, never a shortfall. There is no number of
                  blocks that would have made this day the right one. */}
              <p className="max-w-sm text-sm text-foreground/45">
                {dropping
                  ? "Let go to pick it up."
                  : "Room for another if you want one. Drag it down here."}
              </p>
            </>
          ) : (
            <>
              {/* Not "Nothing running". A day that hasn't started is not a
                  day with something missing from it, and Milo does not open by
                  telling you what you have yet to do. Same rule as the branch
                  above: an invitation, never a shortfall. */}
              <h2 className="text-3xl">Ready when you are.</h2>
              <p className="max-w-sm text-sm text-foreground/45">
                {dropping
                  ? "Let go to start your day."
                  : "Drag a block down here to start it. One at a time."}
              </p>
            </>
          )}
        </div>

        {/* The day so far, along the bottom — the same card as the lineup up
            top, at the same size, so the two rows read as one thing split in
            half: what's still ahead of you, and what's behind you.

            Not buttons and not draggable: a finished block is a fact, and
            there is nothing left to do with it. */}
        {/* pr-20 clears the notes button in the corner — without it the last
            finished block sits under it and its rings are unreadable. */}
        {n > 0 && (
          <div className="flex w-full shrink-0 gap-3 overflow-x-auto p-4 pr-20 pt-0">
            {finished.map((b) => (
              <button
                key={b.id}
                type="button"
                title={b.name}
                /* A finished block is a fact, but finishing one by accident is
                   also a fact. Without this the block leaves the lineup, its
                   tasks leave the board with it, and the tick that ended it is
                   unreachable — no way back at all. Opening it is not editing
                   the record; the sheet just shows what is in it. */
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("milo:open-block", { detail: b.id }),
                  )
                }
                className="flex h-16 min-w-56 flex-1 cursor-pointer items-center justify-between gap-3 rounded-xl px-4 text-left"
                style={{ background: b.bg, color: b.ink }}
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {b.name.replace(" Block", "")}
                  </span>
                  {/* What it took, on the block that took it. Never next to
                      the sum of its tasks' estimates — that comparison is the
                      one thing TIME.md rules out. */}
                  <span className="text-xs opacity-60">
                    {/* every interval is closed on a finished block, so no clock is needed */}
                    {spent(spentOnBlock(b.id)) ?? "Done"}
                  </span>
                </div>
                <TaskRings {...countsFor(b.id)} className="size-9 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      {...drop}
      className={`h-full rounded-2xl transition-shadow ${dropping ? "ring-2 ring-foreground/20" : ""}`}
    >
      <Kanban
        id="milo-task-board"
        modifiers={DRAG_BOUNDS}
        value={board}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
        getItemValue={(item) => item.id}
      >
        <KanbanBoard
          className={`grid items-start gap-3 ${
            shown.length === 3
              ? "grid-cols-[repeat(3,minmax(0,1fr))]"
              : "grid-cols-[repeat(2,minmax(0,1fr))]"
          }`}
        >
          {shown.map((columnId) => {
            const quick = all[columnId].filter(isQuick);
            const sessions = board[columnId];

            return (
              <KanbanColumn key={columnId} value={columnId} className="min-w-0">
                <Card className="min-w-0 gap-0 py-3 ring-0">
                  <CardHeader className="flex items-center gap-2.5 px-3 pb-3">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-medium">
                        {COLUMNS[columnId].title}
                      </h1>
                      <Badge variant="" className="ml-auto tabular-nums">
                        {all[columnId].length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3">
                    {/* the to-do list: small things, one tap each */}
                    {quick.length > 0 && (
                      <div className="mb-2.5 flex flex-col">
                        {quick.map((task) => (
                          <QuickRow
                            key={task.id}
                            task={task}
                            onToggle={() => toggle(task)}
                            onOpen={setOpen}
                          />
                        ))}
                      </div>
                    )}

                    <KanbanColumnContent
                      value={columnId}
                      className="flex flex-col gap-2.5"
                    >
                      {sessions.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          asHandle
                          onOpen={setOpen}
                          onToggle={() => toggle(task)}
                          isRunning={task.id === runningTaskId}
                          elapsed={spent(spentOnTask(task.id, now))}
                        />
                      ))}

                      {/* An empty column says what it is for rather than sitting
                         blank. Never phrased as something missing — an empty
                         Done column is a fact about the day, not a failing. */}
                      {quick.length === 0 && sessions.length === 0 && (
                        <div className="pointer-events-none flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-foreground/10 text-xs text-foreground/30">
                          Drop a task here
                        </div>
                      )}
                    </KanbanColumnContent>
                  </CardContent>
                </Card>
              </KanbanColumn>
            );
          })}
        </KanbanBoard>
        <KanbanOverlay className="rounded-md border-2 border-dashed bg-foreground/5" />
      </Kanban>

      <TaskSheet taskId={open?.id} onClose={() => setOpen(null)} />
    </div>
  );
}
