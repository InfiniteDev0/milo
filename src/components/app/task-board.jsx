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
import { Check, Clock } from "lucide-react";
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
import { useBlocks } from "./blocks-provider";
import { DayComplete } from "./day-complete";
import { TaskRings } from "./task-rings";

// Module scope, so the array identity never changes between renders.
const DRAG_BOUNDS = [restrictToFirstScrollableAncestor];

/* Standing in for a real field. Properly this is a property of the task, set
   when you add it — but adding tasks isn't in the MVP yet, so length is the
   best available guess and the UI won't change when the field arrives. */
const QUICK_MINUTES = 5;
const isQuick = (t) => (t.minutes ?? 0) <= QUICK_MINUTES;

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

const COLUMNS = {
  todo: { title: "To Do", icon: <CircleIcon className="size-4 text-black/40" /> },
  doing: { title: "In Progress", icon: <CircleDot className="size-4 text-black/40" /> },
  done: { title: "Done", icon: <CircleCheckIcon className="size-4 text-black/40" /> },
};

function BlockChip({ block, className = "" }) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] ${className}`}
      style={{ background: `${block.bg}26`, color: block.ink }}
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ background: block.bg }} />
      {block.name.replace(" Block", "")}
    </span>
  );
}

/* Ticking is always reversible and never asks. Un-ticking is a correction, not
   an undoing of something you achieved, so it costs exactly one tap too. */
function Tick({ done, onToggle, className = "size-5" }) {
  return (
    <button
      type="button"
      aria-label={done ? "Put it back" : "Done"}
      /* stop both, and for different reasons: the click would open the detail
         dialog, and the pointerdown would arm a drag */
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${
        done
          ? "bg-foreground text-white"
          : "ring-1 ring-black/20 hover:ring-black/50"
      } ${className}`}
    >
      {done && <Check className="size-3" strokeWidth={3} />}
    </button>
  );
}

/* A moment: one line, one tap. This is the to-do list hiding inside the board,
   and it is deliberately not draggable — there is nowhere for it to go. */
function QuickRow({ task, onToggle, onOpen }) {
  const done = task.status === "done";
  return (
    <div className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-black/[0.03]">
      <Tick done={done} onToggle={onToggle} />
      <button
        type="button"
        onClick={() => onOpen(task)}
        className={`min-w-0 flex-1 cursor-pointer truncate text-left text-sm ${
          done ? "text-black/35 line-through" : ""
        }`}
      >
        {task.name}
      </button>
    </div>
  );
}

function TaskCard({ task, block, asHandle, isOverlay, onOpen, onToggle, isRunning, elapsed }) {
  const done = task.status === "done";
  const content = (
    <Card className="cursor-pointer transition-colors hover:border-black/20">
      <CardContent
        onClick={() => onOpen?.(task)}
        className="flex flex-col gap-2 py-3"
      >
        <div className="flex items-start gap-2">
          {onToggle && <Tick done={done} onToggle={onToggle} className="mt-0.5 size-5" />}
          <span
            className={`line-clamp-2 break-words text-sm ${done ? "text-black/40 line-through" : ""}`}
          >
            {task.name}
          </span>
        </div>
        <div className="flex items-center gap-2 pl-7">
          <BlockChip block={block} className="pointer-events-none" />
          {/* The estimate, and only the estimate. TIME.md: never put this
              and the elapsed figure in the same row — people underestimate
              their own tasks as a rule, so the delta would show a shortfall
              on most tasks on most days. */}
          <span className="pointer-events-none flex items-center gap-1 text-[11px] text-black/35">
            <Clock className="size-3" />
            {task.minutes}m
          </span>

          {isRunning && (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[11px] text-white tabular-nums">
              <span className="size-1.5 animate-pulse rounded-full bg-white" />
              {elapsed ?? "Running"}
            </span>
          )}
        </div>
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
    <div className="h-full min-h-48 animate-pulse rounded-2xl bg-black/[0.03]" />
  );
}

export function TaskBoard() {
  const { tasks, blocks, blockById, countsFor, setTaskStatus, ongoing, startAndLead, hydrated, runningTaskId, spentOnTask, spentOnBlock } =
    useBlocks();
  const [dropping, setDropping] = useState(false);
  const now = useNow(runningTaskId !== null);

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

  const mine = ongoing ? tasks.filter((t) => t.blockId === ongoing.id) : [];

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

  const openBlock = open ? blockById[open.blockId] : null;

  if (!hydrated) return <BoardSkeleton />;

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

    return (
      <div
        {...drop}
        className={`flex h-full min-h-48 flex-col rounded-2xl border-2 border-dashed transition-colors duration-200 ${
          dropping ? "border-black/40 bg-black/[0.03]" : "border-black/10"
        }`}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          {!complete && (
            <img
              src={ART[Math.min(n, ART.length - 1)]}
              alt=""
              className="size-44"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          {complete ? (
            <DayComplete finished={finished} />
          ) : n > 0 ? (
            <>
              <p className="text-sm text-black/70">
                {NUMBER[n] ?? n} {n === 1 ? "block" : "blocks"} done today.{" "}
                <span className="text-black/45">
                  {CHEER[Math.min(n, CHEER.length - 1)]}
                </span>
              </p>

              {/* An invitation, never a shortfall. There is no number of
                  blocks that would have made this day the right one. */}
              <p className="max-w-xs text-xs text-black/30">
                {dropping
                  ? "Let go to pick it up."
                  : "Room for another if you want one. Drag it down here."}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-black/45">Nothing running.</p>
              <p className="max-w-xs text-xs text-black/30">
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
        {n > 0 && (
          <div className="flex w-full shrink-0 gap-3 overflow-x-auto p-4 pt-0">
            {finished.map((b) => (
              <div
                key={b.id}
                title={b.name}
                className="flex h-16 min-w-56 flex-1 items-center justify-between gap-3 rounded-xl px-4 text-left"
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
                    {spent(spentOnBlock(b.id, Date.now())) ?? "Done"}
                  </span>
                </div>
                <TaskRings {...countsFor(b.id)} className="size-9 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      {...drop}
      className={`h-full rounded-2xl transition-shadow ${dropping ? "ring-2 ring-black/20" : ""}`}
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
                          block={blockById[task.blockId]}
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
                        <div className="pointer-events-none flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-black/10 text-xs text-black/30">
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
        <KanbanOverlay className="rounded-md border-2 border-dashed bg-black/5" />
      </Kanban>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-md">
          {open && openBlock && (
            <>
              <DialogHeader>
                <DialogTitle className="text-left">{open.name}</DialogTitle>
                {/* the reason gets the most prominent line — it's the field
                    that separates Milo from a task list */}
                <DialogDescription className="text-left">
                  {open.reason}
                </DialogDescription>
              </DialogHeader>

              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-black/45">Block</dt>
                  <dd>
                    <BlockChip block={openBlock} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-black/45">Takes</dt>
                  <dd>{open.minutes} minutes</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-black/45">Status</dt>
                  <dd className="flex items-center gap-1.5">
                    {COLUMNS[open.status].icon}
                    {COLUMNS[open.status].title}
                  </dd>
                </div>
              </dl>

              {/* No due date here, and no date field on a task anywhere. A task
                  belongs to a block, not to a day, so it cannot be late. */}
              <div className="flex gap-2 pt-1">
                {Object.entries(COLUMNS)
                  /* a moment has no middle, so it isn't offered one here
                     either — the dialog and the board have to agree */
                  .filter(([id]) => id !== open.status)
                  .filter(([id]) => !(isQuick(open) && id === "doing"))
                  .map(([id, col]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setTaskStatus(open.id, id);
                        setOpen({ ...open, status: id });
                      }}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-black/10 px-3 py-2 text-xs transition-colors hover:bg-black/[0.03]"
                    >
                      {col.icon}
                      {col.title}
                    </button>
                  ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
