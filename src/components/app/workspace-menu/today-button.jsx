"use client";

// Beside the workspace, as ClickUp's planner icon. On the Tasks view it opens the date wheel
// in the middle of the screen, which scrolls the days to the date you spin to; everywhere else
// (the Blocks view, other pages) it opens the Calendar page.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePreference } from "@/hooks/use-preference";
import { VIEW } from "@/lib/view";
import { CalendarMark } from "../icons/calendar-mark";
import { DateWheel } from "./date-wheel";

const CLASS =
  "flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-white/10";

export function TodayButton() {
  const [wheel, setWheel] = useState(false);
  // the Tasks view is the home page with that view picked
  const pathname = usePathname();
  const view = usePreference(VIEW);
  const onTasks = pathname === "/daily" && view === "tasks";
  // the Notes page has its own, beside New, that filters the notes by date
  if (pathname === "/notes") return null;

  return (
    <>
      <TooltipProvider delay={200}>
        <Tooltip>
          <TooltipTrigger
            render={onTasks ? <button type="button" onClick={() => setWheel(true)} aria-label="Find a day" /> : <Link href="/calendar" aria-label="Calendar" />}
            className={CLASS}
          >
            <CalendarMark className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            {onTasks ? "Find a day" : "Calendar"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* this year and next, as the Tasks view holds */}
      {onTasks && <DateWheel open={wheel} onOpenChange={setWheel} years={[new Date().getFullYear(), new Date().getFullYear() + 1]} />}
    </>
  );
}
