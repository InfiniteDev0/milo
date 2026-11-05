"use client";

/* A category's tasks, above its notes: the Tasks-view tasks labelled with it (or
   with one of its subcategories), newest day first. A click opens the Tasks view
   on that task's day. Read when the category opens; nothing shows while it loads
   or if there are none, and a failed read says so rather than looking empty. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { listDayTasks } from "@/lib/db/day-tasks";
import { jumpToDayLater } from "@/lib/jump-to-day";
import { VIEW } from "@/lib/view";
import { cn } from "@/lib/utils";

// ids: the category and its subcategories
export function CategoryTasks({ ids }) {
  const router = useRouter();
  // null while it loads, false if it couldn't
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

  if (byDay === null) return null;
  if (byDay === false) return <p className="px-2 pb-2 text-xs text-muted-foreground">Couldn&rsquo;t reach this category&rsquo;s tasks.</p>;

  const wanted = new Set(ids);
  const tasks = Object.entries(byDay)
    .flatMap(([day, list]) => list.filter((t) => wanted.has(t.categoryId)).map((t) => ({ ...t, day: new Date(day) })))
    .sort((a, b) => b.day - a.day);
  if (tasks.length === 0) return null;

  const open = (day) => {
    VIEW.set("tasks");
    jumpToDayLater(day);
    router.push("/daily");
  };

  return (
    <section className="flex shrink-0 flex-col gap-1 px-2 pb-3">
      <h3 className="px-1 pb-1 text-xs font-medium text-muted-foreground">
        Tasks <span className="tabular-nums">{tasks.length}</span>
      </h3>
      <div className="scrollbar-pill flex max-h-44 flex-col gap-1 overflow-y-auto">
        {tasks.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => open(t.day)}
            className="flex h-9 shrink-0 cursor-pointer items-center gap-2.5 rounded-sm border border-foreground/10 bg-card px-3 text-left text-sm transition-colors hover:border-foreground/25"
          >
            <CalendarCheck className={cn("size-4 shrink-0", t.done ? "text-[#00b86b]" : "text-muted-foreground")} />
            <span className={cn("min-w-0 flex-1 truncate", t.done && "text-muted-foreground line-through")}>{t.title || "Untitled task"}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{t.day.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
