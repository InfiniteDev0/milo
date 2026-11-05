"use client";

/* The Blocks view's bar. Blocks are a day, not a row of days, so it names the
   day — "Wednesday : 11/4/2026" — where the Tasks view has its Today button,
   and at the far end has the day's Start / Pause button and how many blocks are
   archived — press that to see them. The date is the browser's, so the
   server leaves it out rather than guess (a different timezone, a different day). */

import { useSyncExternalStore } from "react";
import { Archive } from "lucide-react";
import { useBlocks } from "./blocks-provider";
import { DayTheme } from "./day-theme";
import { BOX, COUNT, ViewHeader } from "./view-header";
import { DayButton } from "./blocks-view/day-button";
import { LockInButton } from "./blocks-view/lock-in-button";

const subscribe = () => () => {};
// "Wednesday|11/4/2026", split again when drawn so the day name can be blue
const dayLabel = () => {
  const d = new Date();
  return `${d.toLocaleDateString(undefined, { weekday: "long" })}|${d.toLocaleDateString("en-US")}`;
};
const onServer = () => "";

export function BlocksHeader() {
  const [weekday, date] = useSyncExternalStore(subscribe, dayLabel, onServer).split("|");
  const { archived, ongoing, focusLocked } = useBlocks();
  const n = archived.length;

  return (
    <ViewHeader
      label={
        date ? (
          <>
            <span className="font-medium text-[#2f80ed]">{weekday}</span>
            <span className="text-muted-foreground">&nbsp;:&nbsp;</span>
            {date}
          </>
        ) : (
          " "
        )
      }
      restingTitle="The Blocks view shows today"
    >
      {/* today's theme, if this weekday has one */}
      <DayTheme />
      {/* only the running block on screen, the rest hidden until you unlock — shown once a block runs */}
      {(ongoing || focusLocked) && <LockInButton />}
      {/* start the day (in the order you choose), pause it, pick it back up */}
      <DayButton />
      {/* the blocks you keep but aren't running this month; opens the shelf they sit on */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("milo:archive"))}
        className={`${BOX} cursor-pointer gap-2 pe-1 transition-colors hover:bg-muted`}
      >
        <Archive className="size-3.5 text-muted-foreground" />
        Archived
        <span className={COUNT}>{n}</span>
      </button>
    </ViewHeader>
  );
}
