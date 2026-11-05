"use client";

// What the Tasks view says when a task lands somewhere: added, moved to another day, copied from a
// past one, duplicated. The same Milo-face toast the Blocks view moves tasks with; one at a time,
// short, never a warning. Done gets the Blocks view's own celebration (celebrate.jsx), not this.

import { toast } from "sonner";
import MiloFace from "@/components/MiloFace";

// "Today", "Tomorrow", "Yesterday", or "Fri, Nov 6"
export function dayName(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((new Date(date).setHours(0, 0, 0, 0) - today) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return new Date(date).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function DayToast({ title, day, hint, mood }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-chrome py-2.5 pl-2.5 pr-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip">
        <MiloFace mood={mood} instant gaze={false} blink={false} reactToScroll={false} className="size-10" />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-1.5 text-sm text-chrome-ink">
          {title}
          {day && <span className="rounded-md bg-card px-1.5 py-0.5 text-xs text-foreground">{day}</span>}
        </span>
        {hint && <span className="truncate text-xs text-chrome-ink/45">{hint}</span>}
      </div>
    </div>
  );
}

// one toast for the Tasks view at a time: a new one replaces the last
export function showDayToast({ title, day, hint, mood = "happy" }) {
  toast.custom(() => <DayToast title={title} day={day} hint={hint} mood={mood} />, {
    unstyled: true,
    id: "milo-day-task",
    duration: 2500,
  });
}
