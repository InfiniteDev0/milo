"use client";

// The app, drawn for the landing page: top bar, the rail, the date, and the columns running off the right edge. view
// picks Block view (a column per block) or Task view (a column per day), from the tabs above it. The arrows step the
// days back and forward, and in Task view a task drags as in the app. The sun in its bar
// flips it and the page between light and dark; the app's sweep, bottom up, plays on the board only. Small rounding, no shadows but Milo's. No data, no providers.

import { useState } from "react";
import { Archive, ChevronDown, ChevronLeft, ChevronRight, ChevronsRight, Moon, Play, Search, Sun } from "lucide-react";
import MiloFace from "@/components/MiloFace";
import { BOARD_THEMES } from "./board-themes";
import { BlockColumns } from "./block-columns";
import { BOARD_VT, sweep } from "./board-sweep";
import { setLandingDark, useLandingDark } from "../landing-theme";
import { ActionSwapIcon } from "@/components/motion/action-swap";
import { DayColumns } from "./day-columns";
import { TASKS, dayAt } from "./board-data";
import { dropTask } from "./board-moves";

const ARROW = "flex size-7 cursor-pointer items-center justify-center rounded-md text-(--b-ink3) hover:bg-(--b-fill2) hover:text-(--b-ink)";

// a sidebar icon: the app's own svg as a mask, coloured here
function RailIcon({ src, label, active }) {
  return (
    <span className="flex flex-col items-center gap-1">
      <span className={`flex size-8 items-center justify-center rounded-md ${active ? "bg-(--b-fill2)" : ""}`}>
        <span
          className="size-[18px]"
          style={{
            mask: `url(${src}) center / contain no-repeat`,
            WebkitMask: `url(${src}) center / contain no-repeat`,
            background: active ? "linear-gradient(180deg,#f5b800,#16a34a)" : "var(--b-icon)",
          }}
        />
      </span>
      <span className={`text-[9px] ${active ? "text-(--b-ink)" : "text-(--b-ink2)"}`}>{label}</span>
    </span>
  );
}

export function BoardShot({ view = "blocks" }) {
  // the page's own light or dark: the toggle here sets both, the sweep plays on the board alone
  const dark = useLandingDark();
  // the first day shown (0 is today), moved by the arrows; the tasks live here so a drag stays put across views
  const [start, setStart] = useState(0);
  const [tasks, setTasks] = useState(TASKS);
  const drop = (from, id, to, index) => setTasks((all) => dropTask(all, from, id, to, index));
  const shown = dayAt(start);

  return (
    <div
      style={{ ...BOARD_THEMES[dark ? "dark" : "light"], viewTransitionName: BOARD_VT }}
      className="w-full overflow-hidden rounded-lg bg-(--b-frame) p-1.5 text-(--b-ink)"
    >
      {/* the top bar */}
      <div className="flex items-center gap-3 px-2 pt-1 pb-2">
        <span className="flex items-center gap-2 rounded-md bg-(--b-rail) py-1.5 pr-2.5 pl-1.5 text-[13px]">
          <span className="flex size-6 items-center justify-center overflow-hidden rounded-[4px] bg-white">
            <MiloFace className="size-6" />
          </span>
          Your Room
          <ChevronDown className="size-3.5 text-(--b-ink2)" />
        </span>
        <span className="ml-auto flex items-center gap-4 text-(--b-ink2)">
          {/* the theme toggle: the board sweeps, the page behind it just switches */}
          <button
            type="button"
            onClick={() => sweep(() => setLandingDark(!dark))}
            aria-label={dark ? "Show it in light" : "Show it in dark"}
            className="flex size-7 cursor-pointer items-center justify-center rounded-md hover:bg-(--b-fill2) hover:text-(--b-ink)"
          >
            {/* as the app: the moon to go dark, the sun to come back */}
            <ActionSwapIcon value={dark ? "dark" : "light"} animation="blur" className="size-4">
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </ActionSwapIcon>
          </button>
          <Search className="size-4" />
          {/* the account: a rounded-square picture and a chevron, as the app's top bar has it */}
          <span className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- a remote picture, too small to need next/image */}
            <img src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg" alt="" className="size-7 rounded-[9px] object-cover" />
            <ChevronDown className="size-3.5" strokeWidth={2.5} />
          </span>
        </span>
      </div>

      <div className="flex gap-1.5">
        {/* the rail: Home and Notes, Settings at the foot */}
        <div className="hidden w-[50px] shrink-0 flex-col items-center gap-3.5 rounded-md bg-(--b-rail) py-3.5 sm:flex">
          <ChevronsRight className="size-3.5 text-(--b-ink2)" />
          <span className="h-px w-5 bg-(--b-fill2)" />
          <RailIcon src="/home.svg" label="Home" active />
          <RailIcon src="/pencil.svg" label="Notes" />
          <span className="mt-auto">
            <RailIcon src="/seetings.svg" label="Settings" />
          </span>
        </div>

        {/* the day */}
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-md bg-(--b-panel)">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="rounded-md bg-(--b-fill) px-3 py-1.5 text-[13px]">
              <span className="text-[#3b82f6]">{shown.toLocaleDateString("en-US", { weekday: "long" })}</span> :{" "}
              {shown.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })}
            </span>
            {/* a day back, a day forward */}
            <button type="button" aria-label="A day back" onClick={() => setStart((n) => n - 1)} className={ARROW}>
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" aria-label="A day forward" onClick={() => setStart((n) => n + 1)} className={ARROW}>
              <ChevronRight className="size-4" />
            </button>
            {/* Start and Archived belong to blocks */}
            {view === "blocks" && (
              <span className="ml-auto hidden items-center gap-2 sm:flex">
                <span className="flex items-center gap-1.5 rounded-md bg-(--b-fill) px-3 py-1.5 text-[13px]">
                  <Play className="size-3.5 fill-current" /> Start
                </span>
                <span className="flex items-center gap-1.5 rounded-md bg-(--b-fill) px-3 py-1.5 text-[13px]">
                  <Archive className="size-3.5" /> Archived
                  <span className="rounded-[4px] bg-(--b-fill2) px-1.5 text-[11px] text-(--b-ink2)">1</span>
                </span>
              </span>
            )}
          </div>
          <div className="flex h-[32rem] gap-6 px-4 pt-1">{view === "blocks" ? <BlockColumns /> : <DayColumns start={start} tasks={tasks} onDrop={drop} />}</div>
          {/* Milo, bottom right, as in the app, lifted off the board */}
          <span className="absolute right-4 bottom-4 flex size-11 items-center justify-center overflow-hidden rounded-md bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
            <MiloFace className="size-11" />
          </span>
        </div>
      </div>
    </div>
  );
}
