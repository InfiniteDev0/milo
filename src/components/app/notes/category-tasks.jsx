"use client";

/* A category's tasks: the Tasks-view tasks labelled with it (or with one of its
   subcategories), newest day first, as rows in its Tasks card. A click opens the
   Tasks view on that task's day; the grip drags it into a new place. A failed
   read says so rather than looking empty. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { listDayTasks } from "@/lib/db/day-tasks";
import { jumpToDayLater } from "@/lib/jump-to-day";
import { VIEW } from "@/lib/view";
import { cn } from "@/lib/utils";
import { ROW } from "./category-panel";

// ids: the category and its subcategories. [tasks, reload]: tasks is null while it loads, false if it couldn't
export function useCategoryTasks(ids) {
  const [byDay, setByDay] = useState(null);
  // bumped to read them again (after a task is added here)
  const [round, setRound] = useState(0);
  const key = ids.join(",");
  useEffect(() => {
    let alive = true;
    listDayTasks()
      .then((d) => alive && setByDay(d))
      .catch(() => alive && setByDay(false));
    return () => {
      alive = false;
    };
  }, [key, round]);
  const reload = () => setRound((r) => r + 1);
  if (!byDay) return [byDay, reload];
  const wanted = new Set(ids);
  const tasks = Object.entries(byDay)
    .flatMap(([day, list]) =>
      list
        .filter((t) => wanted.has(t.categoryId))
        .map((t) => ({ ...t, day: new Date(day) })),
    )
    .sort((a, b) => b.day - a.day);
  return [tasks, reload];
}

// done: a filled green tick; not yet: an empty ring
function Status({ done }) {
  return done ? (
    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#00b86b] text-white">
      <Check className="size-2.5" strokeWidth={3.5} />
    </span>
  ) : (
    <span className="size-4 shrink-0 rounded-full border-[1.5px] border-foreground/30" />
  );
}

// one task in the card, after its grip: a click opens its day in Tasks
export function TaskRow({ task: t, grip }) {
  const router = useRouter();
  const open = () => {
    VIEW.set("tasks");
    jumpToDayLater(t.day);
    router.push("/daily");
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      title="Open its day in Tasks"
      className={ROW}
    >
      {grip}
      <Status done={t.done} />
      <span className={cn("min-w-0 flex-1 truncate", t.done && "text-muted-foreground line-through")}>{t.title || "Untitled task"}</span>
      <span className="shrink-0 text-[11px] tabular-nums text-foreground/35">
        {t.day.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
      </span>
    </div>
  );
}
