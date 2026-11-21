// The board's Task view, as the app's day columns: the day (today in blue) and its date, how many tasks and how many
// done, Add a task, then each task with its tick, a time if it has one, and its tools underneath.

import { Check, CirclePlus, NotebookPen, Play, Workflow } from "lucide-react";
import { DAYS } from "./board-data";

const BLUE = "#2f80ed";

function Task({ title, time, done }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-(--b-fill2) bg-(--b-card) px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${done ? "bg-[#00b86b] text-white" : "border border-(--b-line)"}`}>
          {done && <Check className="size-3" strokeWidth={3} />}
        </span>
        <span className={`min-w-0 flex-1 text-left text-[13px] ${done ? "text-(--b-ink3) line-through" : "text-(--b-ink)"}`}>{title}</span>
        {time && (
          <span className="shrink-0 rounded-[4px] px-1.5 py-0.5 text-[11px] tabular-nums" style={{ background: `${BLUE}1f`, color: BLUE }}>
            {time}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2.5 text-(--b-ink3)">
        <NotebookPen className="size-3.5" />
        <Workflow className="size-3.5" />
        <Play className="size-3.5" />
        <span className="ml-auto rounded-[4px] bg-(--b-fill2) px-1.5 py-0.5 text-[11px] text-(--b-ink2) tabular-nums">0:00</span>
      </div>
    </div>
  );
}

function Day({ day, date, today, tasks }) {
  const done = tasks.filter((t) => t.done).length;
  return (
    <div className="flex w-[15rem] shrink-0 flex-col gap-2">
      <div className="flex h-9 items-center gap-1.5">
        <span className="text-[15px] font-semibold!" style={today ? { color: BLUE } : undefined}>
          {day}
        </span>
        <span className="text-[15px] text-(--b-ink3)">{date}</span>
        <span className="ml-auto flex items-center gap-1.5">
          {/* as the app: no count on an empty day */}
          {tasks.length > 0 && (
            <span className="rounded-[4px] bg-(--b-fill2) px-1.5 py-0.5 text-[11px] text-(--b-ink2) tabular-nums">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </span>
          )}
          {done > 0 && <span className="rounded-[4px] bg-[#00b86b]/15 px-1.5 py-0.5 text-[11px] text-[#00a35f] tabular-nums">{done} done</span>}
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-(--b-fill2) bg-(--b-card) px-3 py-2.5 text-[13px] text-(--b-ink2)">
        <CirclePlus className="size-3.5" />
        Add a task
      </div>
      {tasks.map((t) => (
        <Task key={t.title} {...t} />
      ))}
    </div>
  );
}

export function DayColumns() {
  return DAYS.map((d) => <Day key={d.day} {...d} />);
}
