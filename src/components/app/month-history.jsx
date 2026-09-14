"use client";

/* The month, looking backwards.
 *
 * A real calendar: date numbers, weekday columns, and the months either side a
 * click away. Each day carries the colours of the blocks you actually finished
 * on it.
 *
 * BLANK IS THE WHOLE DESIGN. There is no grey "missed" cell, no dash, no count
 * of empty days, no chain to break, and nothing that compares one day to
 * another. A day you sat out looks exactly like a day that hasn't happened yet,
 * because to Milo those are the same thing — and `summarise` in the provider
 * files nothing at all for a day where nothing finished, so an empty day isn't
 * even stored as a zero.
 *
 * That rule is what keeps this from becoming the contribution graph it
 * visually resembles.
 */

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBlocks } from "./blocks-provider";
import { Button } from "../ui/button";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const spent = (total) => {
  if (!total) return null;
  if (total < 60) return `${total}m`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

const stampOf = (y, m, d) => `${y}-${m + 1}-${d}`;

// built on the client only, so there is no server/browser locale to disagree
const longDate = (y, m, d) =>
  new Date(y, m, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const monthName = (y, m) =>
  new Date(y, m, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

/* Held while the date resolves and localStorage is read.

   Same grid, same cell height, same weekday row — so the real calendar
   replaces it in place instead of the page jumping. It shows the SHAPE and
   never fake content: no numbers, no colours, nothing that could be read as
   a day you did and then have to be taken away. */
function MonthSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="h-7 w-48 rounded-lg bg-foreground/[0.06]" />
        <div className="size-7 rounded-lg bg-foreground/[0.04]" />
        <div className="size-7 rounded-lg bg-foreground/[0.04]" />
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-1 text-sm text-foreground/20">
            {d}
          </span>
        ))}

        {Array.from({ length: 35 }, (_, i) => (
          <div
            key={i}
            className="min-h-24 rounded-xl bg-foreground/[0.02] ring-1 ring-foreground/[0.06]"
          />
        ))}
      </div>
    </div>
  );
}

function DayCell({ date, entry, isToday, muted, onOpen }) {
  const bands = entry?.blocks.slice(0, 4) ?? [];

  const inner = (
    <>
      <span
        className={`text-sm tabular-nums ${
          muted
            ? "text-foreground/20"
            : isToday
              ? "font-semibold text-foreground"
              : "text-foreground/45"
        }`}
      >
        {date}
      </span>

      {entry && (
        <span className="mt-auto flex flex-wrap items-center gap-1">
          {bands.map((b) => (
            <span
              key={b.id}
              title={b.name?.replace(" Block", "") ?? "A block"}
              className="h-2.5 w-6 rounded-full"
              style={{ background: b.bg }}
            />
          ))}
          {entry.blocks.length > bands.length && (
            <span className="text-[10px] leading-none text-foreground/35">
              +{entry.blocks.length - bands.length}
            </span>
          )}
        </span>
      )}
    </>
  );

  const shell = `flex min-h-24 flex-col rounded-xl p-2.5 text-left ring-1 ${
    isToday ? "ring-2 ring-foreground/60" : "ring-foreground/[0.08]"
  }`;

  /* Only a day with something in it is a button. A blank day is not a thing to
     be opened, and making it clickable would invite you to go looking for what
     is not there. */
  if (!entry) {
    return (
      <div className={shell} aria-hidden={muted}>
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      title={entry.label}
      className={`${shell} cursor-pointer transition-colors hover:bg-foreground/[0.03]`}
    >
      {inner}
    </button>
  );
}

export function MonthHistory() {
  const { history, blocks, tasks, hydrated } = useBlocks();
  const [open, setOpen] = useState(null);

  /* Which month it is gets decided after mount, never during render. The
     server and the browser can be on different sides of midnight, and a
     calendar drawn from `new Date()` at render time is a hydration mismatch
     waiting for the right time of day. */
  const [today, setToday] = useState(null);
  const [cursor, setCursor] = useState(null);

  useEffect(() => {
    const now = new Date();
    setToday({ y: now.getFullYear(), m: now.getMonth(), d: now.getDate() });
    setCursor({ y: now.getFullYear(), m: now.getMonth() });
  }, []);

  /* TODAY IS NOT IN `history` YET. History is written when a day is filed — on
     "Start a fresh day", or on the rollover when you come back on a later date.
     A day in progress has to be read straight off the live blocks, or the work
     you did an hour ago leaves today's cell blank. */
  const liveToday = useMemo(() => {
    const done = blocks
      .filter((b) => b.status === "done")
      .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0))
      .map(({ id, name, bg, ink }) => ({ id, name, bg, ink }));
    const finished = tasks.filter((t) => t.status === "done");
    if (done.length === 0 && finished.length === 0) return null;
    return {
      blocks: done,
      tasks: finished.length,
      minutes: finished.reduce((m, t) => m + (t.minutes ?? 0), 0),
    };
  }, [blocks, tasks]);

  /* Two things have to land before this means anything: the date (client
     only, see above) and the stored history. Rendering between them would
     show an empty month for a beat and then fill it in — which reads as
     'you did nothing' followed by a correction. */
  if (!today || !cursor || !hydrated) return <MonthSkeleton />;

  const { y, m } = cursor;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const daysInPrev = new Date(y, m, 0).getDate();
  // Monday-first, so the weekend columns sit together at the end
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;

  const todayStamp = stampOf(today.y, today.m, today.d);
  const byDate = Object.fromEntries(history.map((h) => [h.date, h]));

  /* If you filed a day and then kept going, both halves are true and both
     belong to the same cell. Adding them is the honest answer; showing one
     would quietly delete the other. */
  const filedToday = byDate[todayStamp] ?? null;
  const todayEntry =
    liveToday && filedToday
      ? {
          ...filedToday,
          blocks: [...filedToday.blocks, ...liveToday.blocks],
          tasks: filedToday.tasks + liveToday.tasks,
          minutes: filedToday.minutes + liveToday.minutes,
        }
      : liveToday
        ? {
            date: todayStamp,
            label: longDate(today.y, today.m, today.d),
            ...liveToday,
          }
        : filedToday;

  const entryFor = (stamp) =>
    stamp === todayStamp ? todayEntry : (byDate[stamp] ?? null);

  const lived = [
    ...history.filter((h) => {
      const [hy, hm] = h.date.split("-").map(Number);
      return hy === y && hm === m + 1 && h.date !== todayStamp;
    }),
    ...(todayEntry && today.y === y && today.m === m ? [todayEntry] : []),
  ];

  const blocksDone = lived.reduce((n, h) => n + h.blocks.length, 0);
  const tasksDone = lived.reduce((n, h) => n + h.tasks, 0);
  const minutes = lived.reduce((n, h) => n + h.minutes, 0);

  /* Back as far as you like; forward stops at this month.

     This is a record of what happened, and a future month can only ever be
     blank — an empty October in September is not information, it is a grid
     of nothing that looks like a grid of failures. Milo also has no forward
     plan to show: a block is started, never scheduled. */
  const atLatest = y === today.y && m === today.m;

  const step = (by) => {
    if (by > 0 && atLatest) return;
    const next = new Date(y, m + by, 1);
    setCursor({ y: next.getFullYear(), m: next.getMonth() });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-sm tracking-wide text-foreground/45 uppercase">
            {monthName(y, m)}
          </h2>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              onClick={() => step(-1)}
              aria-label="Previous month"
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground/70"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => step(1)}
              disabled={atLatest}
              aria-label="Next month"
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground/70"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Counts up, always. Never "out of" anything — nobody set a number
            for this month to fall short of. */}
        {lived.length > 0 && (
          <p className="text-xs text-foreground/40 tabular-nums">
            {lived.length} {lived.length === 1 ? "day" : "days"} · {blocksDone}{" "}
            {blocksDone === 1 ? "block" : "blocks"} · {tasksDone}{" "}
            {tasksDone === 1 ? "thing" : "things"}
            {minutes > 0 && ` · ${spent(minutes)}`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-1 text-sm text-foreground/45">
            {d}
          </span>
        ))}

        {/* the tail of last month, greyed — the row has to start somewhere */}
        {Array.from({ length: lead }, (_, i) => (
          <DayCell
            key={`lead-${i}`}
            date={daysInPrev - lead + i + 1}
            entry={null}
            muted
          />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = i + 1;
          const stamp = stampOf(y, m, date);
          return (
            <DayCell
              key={stamp}
              date={date}
              entry={entryFor(stamp)}
              isToday={stamp === todayStamp}
              onOpen={setOpen}
            />
          );
        })}
      </div>

      {lived.length === 0 && (
        <p className="text-sm text-foreground/40">
          Days fill in here as you finish them.
        </p>
      )}

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-sm">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="text-left">{open.label}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-1.5">
                {open.blocks.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center rounded-lg px-3 py-2 text-sm"
                    style={{ background: b.bg, color: b.ink }}
                  >
                    {b.name.replace(" Block", "")}
                  </div>
                ))}
              </div>

              <p className="text-xs text-foreground/40 tabular-nums">
                {open.tasks} {open.tasks === 1 ? "thing" : "things"}
                {open.minutes > 0 && ` · ${spent(open.minutes)} in them`}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
