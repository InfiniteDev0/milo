// Little drawings of the app for the landing page: the real look, no data, no Supabase.

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const PURPLE = "#5e17eb";

export const LABELS = {
  Work: { bg: "#e9e0ff", ink: "#4512b8" },
  Home: { bg: "#dff5e9", ink: "#0b7a4b" },
  Health: { bg: "#ffe4ec", ink: "#b8124f" },
  Errands: { bg: "#fff1d6", ink: "#8a5a00" },
};

// one task: a tick, the words, a label chip
export function TaskCard({ title, label, time, done }) {
  const tone = LABELS[label];
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-[#f6f5f2] px-3 py-2.5">
      <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full", done ? "bg-[#00b86b] text-white" : "bg-black/10")}>
        {done && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className={cn("text-[13px] leading-snug", done ? "text-black/40" : "text-black/85")}>{title}</span>
        <span className="flex items-center gap-1.5">
          {tone && <span className="rounded-md px-1.5 py-0.5 text-[10px]" style={{ background: tone.bg, color: tone.ink }}>{label}</span>}
          {time && <span className="text-[10px] text-black/40">{time}</span>}
        </span>
      </span>
    </div>
  );
}

// a day: its name (today's in colour), how many tasks, how many done
export function DayColumn({ day, date, today, tasks }) {
  const done = tasks.filter((t) => t.done).length;
  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px]">
          <span className={today ? "font-medium text-[#5e17eb]" : "text-black/80"}>{day}</span>
          <span className="ml-1.5 text-black/35">{date}</span>
        </span>
        <span className="flex gap-1 text-[10px] text-black/45">
          <span className="rounded-full bg-black/5 px-1.5 py-0.5">{tasks.length} tasks</span>
          {done > 0 && <span className="rounded-full bg-[#00b86b]/10 px-1.5 py-0.5 text-[#0b7a4b]">{done} done</span>}
        </span>
      </div>
      {tasks.map((t) => (
        <TaskCard key={t.title} {...t} />
      ))}
    </div>
  );
}

// a note: a cover (a colour, or its own words blurred), a title, its block
export function NoteCard({ title, block, cover, text, selected }) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_12px_rgba(0,0,0,0.06)]", selected && "ring-2 ring-[#5e17eb]")}>
      <div className="relative h-16 overflow-hidden" style={cover ? { background: cover } : { background: "#f6f5f2" }}>
        {!cover && <p className="p-2.5 text-[9px] leading-relaxed text-black/50 blur-[2px]">{text}</p>}
      </div>
      <div className="flex flex-col gap-0.5 px-2.5 py-2">
        <span className="truncate text-[12px] text-black/85">{title}</span>
        <span className="text-[10px] text-black/40">{block}</span>
      </div>
    </div>
  );
}
