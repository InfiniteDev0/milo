"use client";

// The app's Block view, drawn for the landing page: top bar, the rail, the date, and the block columns running off the
// right edge. The sun in its bar flips it between light and dark, as the app's does. Small rounding, no shadows but
// Milo's. No data, no providers.

import { useState } from "react";
import { Archive, ChevronDown, ChevronLeft, ChevronRight, ChevronsRight, CirclePlus, Moon, Play, Search, Sun } from "lucide-react";
import MiloFace from "@/components/MiloFace";
import { BLOCKS } from "./board-data";
import { BOARD_THEMES } from "./board-themes";

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

// a block: its coloured head, Add a task, then today's tasks
function Column({ name, tone, ink, tasks, hidden }) {
  return (
    <div className="flex w-[15rem] shrink-0 flex-col gap-2.5">
      <div className="flex items-center justify-between rounded-md px-4 py-3" style={{ background: tone, color: ink }}>
        <span className="flex flex-col text-left">
          <span className="text-[15px]">{name}</span>
          <span className="text-[11px] opacity-70">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
        </span>
        {/* start: a white tile with a ring in it */}
        <span className="flex size-8 items-center justify-center rounded-md bg-white/85">
          <span className="size-3.5 rounded-[4px] border-[3px] border-black" />
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-md bg-(--b-fill) px-3 py-2.5 text-[13px] text-(--b-ink2)">
        <CirclePlus className="size-4" />
        Add a task
      </div>
      {tasks.map((t) => (
        <div key={t} className="flex items-center gap-2.5 rounded-md border bg-(--b-card) px-3 py-3" style={{ borderColor: tone }}>
          <span className="size-4 shrink-0 rounded-full border border-(--b-line)" />
          <span className="flex-1 text-left text-[13px] text-(--b-ink)">{t}</span>
          <Play className="size-3.5 fill-current text-(--b-ink2)" />
          <span className="rounded-[4px] bg-(--b-fill2) px-1.5 py-0.5 text-[11px] text-(--b-ink2) tabular-nums">0:00</span>
        </div>
      ))}
      {hidden && (
        <div className="flex items-center gap-2 rounded-md bg-(--b-fill) px-3 py-2.5 text-[13px] text-(--b-ink2)">
          <span className="flex-1 text-left">Hidden tasks</span>
          <span className="rounded-[4px] bg-(--b-fill2) px-1.5 text-[11px]">{hidden}</span>
          <ChevronDown className="size-3.5" />
        </div>
      )}
    </div>
  );
}

export function BoardShot() {
  const [dark, setDark] = useState(false);

  return (
    <div
      style={BOARD_THEMES[dark ? "dark" : "light"]}
      className="w-full overflow-hidden rounded-lg bg-(--b-frame) p-1.5 text-(--b-ink) transition-colors duration-300 [&_*]:transition-colors [&_*]:duration-300"
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
          {/* the theme toggle: flips this board, not the page */}
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? "Show it in light" : "Show it in dark"}
            className="flex size-7 cursor-pointer items-center justify-center rounded-md hover:bg-(--b-fill2) hover:text-(--b-ink)"
          >
            {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
          <Search className="size-4" />
          <span className="flex rounded-md bg-(--b-fill2) p-0.5 text-[12px]">
            <span className="px-3 py-1 text-(--b-ink2)">Tasks</span>
            <span className="rounded-[5px] bg-white px-3 py-1 text-black">Blocks</span>
          </span>
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
              <span className="text-[#3b82f6]">Saturday</span> : 11/21/2026
            </span>
            <ChevronLeft className="size-4 text-(--b-ink3)" />
            <ChevronRight className="size-4 text-(--b-ink3)" />
            <span className="ml-auto hidden items-center gap-2 sm:flex">
              <span className="flex items-center gap-1.5 rounded-md bg-(--b-fill) px-3 py-1.5 text-[13px]">
                <Play className="size-3.5 fill-current" /> Start
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-(--b-fill) px-3 py-1.5 text-[13px]">
                <Archive className="size-3.5" /> Archived
                <span className="rounded-[4px] bg-(--b-fill2) px-1.5 text-[11px] text-(--b-ink2)">1</span>
              </span>
            </span>
          </div>
          <div className="flex h-[32rem] gap-6 px-4 pt-1">
            {BLOCKS.map((b) => (
              <Column key={b.name} {...b} />
            ))}
          </div>
          {/* Milo, bottom right, as in the app, lifted off the board */}
          <span className="absolute right-4 bottom-4 flex size-11 items-center justify-center overflow-hidden rounded-md bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
            <MiloFace className="size-11" />
          </span>
        </div>
      </div>
    </div>
  );
}
