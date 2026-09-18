"use client";

// Said once, when a task has run for the time you set: how long, on what, and one press to call it done.

import { toast } from "sonner";
import MiloFace from "@/components/MiloFace";

function TimerToast({ id, minutes, name, onDone }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl bg-chrome p-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip">
        <MiloFace mood="content" instant gaze={false} blink={false} reactToScroll={false} className="size-10" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-chrome-ink">
          {minutes} {minutes === 1 ? "minute" : "minutes"} on {name}.
        </span>
        {/* the time you set, said as a fact — keeping going is as fine as stopping */}
        <span className="truncate text-xs text-chrome-ink/45">The time you set. Keep going or wrap up.</span>
      </div>

      <button
        type="button"
        onClick={() => {
          onDone();
          toast.dismiss(id);
        }}
        className="flex h-9 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-xl bg-chip px-3.5 text-sm text-chip-ink transition-colors hover:bg-chip/85"
      >
        Mark done
      </button>
    </div>
  );
}

export function showTimerToast({ key, minutes, name, onDone }) {
  const id = `milo-timer-${key}`;
  toast.custom(() => <TimerToast id={id} minutes={minutes} name={name} onDone={onDone} />, {
    unstyled: true,
    id,
    duration: 12000,
  });
}
