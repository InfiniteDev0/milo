"use client";

/* The clock that's running, floating at the bottom right of the Tasks view, clear of the long scrollbar —
   beside Milo's face, not over it. The time and the task's name, and Pause.
   On hover, three: Done (banks the time and ticks it, with the usual
   celebration), Stop (banks the time and closes the timer), and Pause, or
   Play once paused. A paused timer stays, its time dimmed, so you can pick the
   same task straight back up; Stop is what puts it away. */

import { useState } from "react";
import { Check, Pause, Play, Square } from "lucide-react";
import { useNow } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Tip } from "./tip";
import { spentMs } from "./task-card";

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

const ROUND = "flex size-8 cursor-pointer items-center justify-center rounded-full bg-white transition-transform hover:scale-105";

// tasks: { [dayKey]: task[] }. onPatch(key, id, patch); onDone(key, id) ticks it done
export function RunningTimer({ tasks, onPatch, onDone }) {
  // the one paused from here, kept showing until it\x27s resumed, stopped or done
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
    if (t) found = { key: paused.key, task: t };
  }
  const running = Boolean(found?.task.startedAt);
  const now = useNow(running, 1000);
  if (!found) return null;

  const { key, task } = found;
  // the clock\x27s time, banked into the task as it stops
  const bank = () => (running ? { actualMs: spentMs(task, nowMs()), startedAt: null } : {});

  const pause = () => {
    onPatch(key, task.id, bank());
    setPaused({ key, id: task.id });
  };
  const resume = () => {
    onPatch(key, task.id, { startedAt: nowMs() });
    setPaused(null);
  };
  const stop = () => {
    if (running) onPatch(key, task.id, bank());
    setPaused(null);
  };
  const done = () => {
    if (running) onPatch(key, task.id, bank());
    if (!task.done) onDone(key, task.id);
    setPaused(null);
  };

  return (
    // Milo's face's height and corners (size-12, rounded-xl), level with it, and flat like it
    <div className="group/timer fixed right-[5.5rem] bottom-12 z-40 flex h-12 items-center gap-5 rounded-xl bg-black pr-2 pl-3.5 text-white">
      <div className="flex min-w-0 flex-col">
        <span className={cn("font-mono text-lg leading-none tabular-nums", !running && "text-white/45")}>{clockOf(spentMs(task, now))}</span>
        <span className="max-w-40 truncate pt-0.5 text-[11px] font-semibold leading-tight">{task.title || "Untitled task"}</span>
      </div>
      <div className="flex items-center gap-2">
        {/* on hover: Done and Stop join Pause / Play */}
        <span className="hidden items-center gap-2 group-focus-within/timer:flex group-hover/timer:flex">
          <Tip label="Done">
            <button type="button" onClick={done} aria-label="Done" className={ROUND}>
              <Check className="size-4 text-[#00b86b]" strokeWidth={3} />
            </button>
          </Tip>
          <Tip label="Stop">
            <button type="button" onClick={stop} aria-label="Stop the timer" className={ROUND}>
              <Square className="size-3.5 fill-[#ef4444] text-[#ef4444]" />
            </button>
          </Tip>
        </span>
        <Tip label={running ? "Pause" : "Resume"}>
          <button type="button" onClick={running ? pause : resume} aria-label={running ? "Pause" : "Resume"} className={ROUND}>
            {running ? <Pause className="size-3.5 fill-black text-black" /> : <Play className="size-3.5 fill-[#555] text-[#555]" />}
          </button>
        </Tip>
      </div>
    </div>
  );
}
