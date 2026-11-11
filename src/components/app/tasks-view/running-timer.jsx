"use client";

/* The clock that's running, floating at the bottom right — beside Milo's face,
   his height, flat like him, clear of the long scrollbar. The time and the
   task's name, and Pause. On hover, three: Done (ticks it, with the usual
   celebration — and if it beat its estimate, Milo says so), Stop (puts the
   timer away), and Pause, or Play once paused. A paused timer stays, its time
   dimmed, so the same task can be picked straight back up.

   FloatingTimer is only the box; each view feeds it: RunningTimer for the
   Tasks view's day tasks (here), BlockTimer for block tasks (blocks-view). */

import { useState } from "react";
import { Check, Pause, Play, Square } from "lucide-react";
import { useNow } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Tip } from "./tip";
import { spentMs } from "./task-card";
import { markStep } from "../whats-new/steps";

// 00:39, 12:05, 1:02:45
function clockOf(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

// the time now, read when a button is pressed (never while drawing)
const nowMs = () => Date.now();

const ROUND = "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white transition-transform hover:scale-105";
// the accordion's ease, a touch slower so the opening reads
const EASE = "duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)]";
// a hover button arriving: from small and clear to its size (and back as the pointer leaves)
const REVEAL =
  "scale-75 opacity-0 transition-[scale,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-focus-within/timer:scale-100 group-focus-within/timer:opacity-100 group-hover/timer:scale-100 group-hover/timer:opacity-100 hover:scale-105";

// spent(now): the time on it so far. running: its clock is moving
export function FloatingTimer({ title, running, spent, onPause, onResume, onDone, onStop }) {
  const now = useNow(running, 1000);
  // using any of its buttons counts for the What's new step
  const used = (fn) => () => {
    markStep("use-timer");
    fn();
  };
  return (
    // Milo's face's height and corners (size-12, rounded-xl), level with it, and flat like it
    <div data-tour="floating-timer" className="group/timer fixed right-[5.5rem] bottom-12 z-40 flex h-12 items-center gap-5 rounded-xl bg-black pr-2 pl-3.5 text-white">
      <div className="flex min-w-0 flex-col">
        <span className={cn("font-mono text-lg leading-none tabular-nums", !running && "text-white/45")}>{clockOf(spent(now))}</span>
        <span className="max-w-40 truncate pt-0.5 text-[11px] font-semibold leading-tight">{title || "Untitled task"}</span>
      </div>
      <div className="flex items-center">
        {/* on hover: Done and Stop slide open beside Pause / Play — the column eases from nothing
            to its width (the accordion's ease), and each button fades and grows in after it */}
        <span className={cn("grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity]", EASE, "group-focus-within/timer:grid-cols-[1fr] group-focus-within/timer:opacity-100 group-hover/timer:grid-cols-[1fr] group-hover/timer:opacity-100")}>
          <span className="flex min-w-0 items-center gap-2 overflow-hidden py-1 ps-0.5 pe-2">
            <Tip label="Done">
              <button type="button" onClick={used(onDone)} aria-label="Done" className={cn(ROUND, REVEAL, "delay-75")}>
                <Check className="size-4 text-[#00b86b]" strokeWidth={3} />
              </button>
            </Tip>
            <Tip label="Stop">
              <button type="button" onClick={used(onStop)} aria-label="Stop the timer" className={cn(ROUND, REVEAL, "delay-150")}>
                <Square className="size-3.5 fill-[#ef4444] text-[#ef4444]" />
              </button>
            </Tip>
          </span>
        </span>
        <Tip label={running ? "Pause" : "Resume"}>
          <button type="button" onClick={used(running ? onPause : onResume)} aria-label={running ? "Pause" : "Resume"} className={ROUND}>
            {running ? <Pause className="size-3.5 fill-black text-black" /> : <Play className="size-3.5 fill-[#555] text-[#555]" />}
          </button>
        </Tip>
      </div>
    </div>
  );
}

// the Tasks view's: tasks is { [dayKey]: task[] }. onPatch(key, id, patch); onDone(key, id) ticks it done
export function RunningTimer({ tasks, onPatch, onDone }) {
  // the one paused from here, kept showing until it's resumed, stopped or done
  const [paused, setPaused] = useState(null);

  let found = null;
  for (const [key, list] of Object.entries(tasks)) {
    const t = list.find((x) => x.startedAt);
    if (t) {
      found = { key, task: t };
      break;
    }
  }
  if (!found && paused) {
    const t = (tasks[paused.key] ?? []).find((x) => x.id === paused.id);
    if (t && !t.done) found = { key: paused.key, task: t };
  }
  if (!found) return null;

  const { key, task } = found;
  const running = Boolean(task.startedAt);
  // the clock's time, banked into the task as it stops
  const bank = () => (running ? { actualMs: spentMs(task, nowMs()), startedAt: null } : {});

  return (
    <FloatingTimer
      title={task.title}
      running={running}
      spent={(now) => spentMs(task, now)}
      onPause={() => {
        onPatch(key, task.id, bank());
        setPaused({ key, id: task.id });
      }}
      onResume={() => {
        onPatch(key, task.id, { startedAt: nowMs() });
        setPaused(null);
      }}
      onStop={() => {
        if (running) onPatch(key, task.id, bank());
        setPaused(null);
      }}
      // ticking it done banks the time itself (and says so if it beat the estimate)
      onDone={() => {
        if (!task.done) onDone(key, task.id);
        setPaused(null);
      }}
    />
  );
}
