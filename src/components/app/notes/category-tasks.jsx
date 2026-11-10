"use client";

/* A category's tasks: the Tasks-view tasks labelled with it (or with one of its
   subcategories), newest day first, as one list with lines between the rows.
   A click opens the Tasks view on that task's day. A failed read says so rather
   than looking empty. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { listDayTasks } from "@/lib/db/day-tasks";
import { jumpToDayLater } from "@/lib/jump-to-day";
import { VIEW } from "@/lib/view";
import { cn } from "@/lib/utils";

// ids: the category and its subcategories. null while it loads, false if it couldn't, else the tasks
export function useCategoryTasks(ids) {
  const [byDay, setByDay] = useState(null);
  const key = ids.join(",");
  useEffect(() => {
    let alive = true;
    listDayTasks()
      .then((d) => alive && setByDay(d))
      .catch(() => alive && setByDay(false));
    return () => {
      alive = false;
    };
  }, [key]);
  if (!byDay) return byDay;
  const wanted = new Set(ids);
  return Object.entries(byDay)
    .flatMap(([day, list]) => list.filter((t) => wanted.has(t.categoryId)).map((t) => ({ ...t, day: new Date(day) })))
    .sort((a, b) => b.day - a.day);
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

export function CategoryTasks({ tasks }) {
  const router = useRouter();
  const open = (day) => {
    VIEW.set("tasks");
    jumpToDayLater(day);
    router.push("/daily");
  };
  return (
    <ul className="scrollbar-pill max-h-60 divide-y divide-foreground/8 overflow-y-auto rounded-lg border border-foreground/10">
      {tasks.map((t) => (
        <li key={t.id}>
          <button
            type="button"
            onClick={() => open(t.day)}
            className="flex h-10 w-full cursor-pointer items-center gap-3 px-3 text-left text-sm transition-colors hover:bg-foreground/4"
          >
            <Status done={t.done} />
            <span className={cn("min-w-0 flex-1 truncate", t.done && "text-muted-foreground line-through")}>{t.title || "Untitled task"}</span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {t.day.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
