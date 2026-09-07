"use client";

// DEMO ONLY — a candidate for the (app) shell. Fake data, no persistence.
// Nothing imports this except /demo/shell.

import { useState } from "react";
import {
  CalendarDays, ChevronDown, ChevronLeft, ChevronRight, CircleDot, Clock,
  HelpCircle, Inbox, Layers, Lightbulb, ListTodo, Pause, Play, Repeat,
  Settings, SkipForward, Sparkles, Trash2,
} from "lucide-react";
import MiloFace from "@/components/MiloFace";

const ACCENT = "#5e17eb";

const NAV = [
  { icon: CalendarDays, label: "Daily", active: true, children: ["Monthly", "Yearly"] },
  { icon: Repeat, label: "Habits", soon: true },
  { icon: Layers, label: "Library", soon: true },
  { icon: ListTodo, label: "Projects", soon: true },
  { icon: Lightbulb, label: "Idea Dump", soon: true },
];

const INITIAL = [
  { name: "Morning", category: "Routine", ran: 18, status: "done",
    tasks: [["Water + stretch", "done"], ["Journal", "done"], ["Clear the inbox", "done"]] },
  { name: "Deep Work", category: "Focus", ran: 12, status: "ongoing",
    tasks: [["Draft the spec", "done"], ["Ship the auth flow", "doing"], ["Review PRs", "todo"]] },
  { name: "Learning", category: "Growth", ran: 7, status: "todo",
    tasks: [["Read one chapter", "todo"], ["Take notes", "todo"]] },
  { name: "Wind Down", category: "Recovery", ran: 9, status: "todo",
    tasks: [["Tidy the desk", "todo"], ["Plan tomorrow", "todo"]] },
];

const COLUMNS = [
  ["todo", "To Do"],
  ["doing", "In Progress"],
  ["done", "Done"],
];

const TIMEBOX = [
  { label: "Morning", start: 6, span: 3, tone: "bg-black text-white" },
  { label: "Deep Work", start: 10, span: 4, tone: "text-white" },
  { label: "Learning", start: 15, span: 2, tone: "bg-black/10 text-black/60" },
  { label: "Wind Down", start: 20, span: 2, tone: "bg-black/10 text-black/60" },
];

export default function AppShell({ variant = "rail" }) {
  const [blocks, setBlocks] = useState(INITIAL);
  const [collapsed, setCollapsed] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(true);

  const start = (i) =>
    setBlocks((prev) =>
      prev.map((b, k) =>
        k === i
          ? { ...b, status: b.status === "ongoing" ? "paused" : "ongoing" }
          : b.status === "ongoing"
            ? { ...b, status: "paused" }
            : b,
      ),
    );

  // Skipping leaves no artifact — the block simply isn't part of today.
  const skip = (i) => setBlocks((prev) => prev.filter((_, k) => k !== i));

  const live = blocks.filter((b) => b.status !== "skipped");
  const tasks = live.flatMap((b) => b.tasks.map(([name, status]) => ({ name, status, block: b.name })));
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const blocksDone = live.filter((b) => b.status === "done").length;
  const ongoing = live.find((b) => b.status === "ongoing");

  return (
    <div className="flex min-h-svh w-full bg-[#f4f2ee] text-black">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`sticky top-0 flex h-svh shrink-0 flex-col justify-between border-r border-black/8 bg-white transition-[width] duration-300 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        <div className="flex flex-col gap-1 p-3">
          <div className="flex items-center justify-between gap-2 px-1 pb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <MiloFace className="size-9 shrink-0 touch-none select-none" />
              {!collapsed && <span className="truncate text-lg">Milo</span>}
            </div>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="shrink-0 cursor-pointer rounded-md p-1 text-black/30 transition-colors hover:bg-black/5 hover:text-black/60"
              aria-label="Toggle sidebar"
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>

          <div className="mb-1 h-px bg-black/8" />

          {NAV.map(({ icon: Icon, label, active, children, soon }) => (
            <div key={label} className="flex flex-col">
              <button
                onClick={() => children && setDailyOpen((o) => !o)}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  active ? "bg-black/5 font-medium text-black" : "text-black/55 hover:bg-black/[0.03]"
                } ${soon ? "cursor-default" : "cursor-pointer"}`}
                title={collapsed ? label : undefined}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{label}</span>
                    {soon && <span className="text-[10px] text-black/25">soon</span>}
                    {children && (
                      <ChevronDown
                        className={`size-3.5 text-black/30 transition-transform ${dailyOpen ? "" : "-rotate-90"}`}
                      />
                    )}
                  </>
                )}
              </button>

              {children && dailyOpen && !collapsed && (
                <div className="ml-6 flex flex-col border-l border-black/8 pl-2">
                  {children.map((c) => (
                    <button
                      key={c}
                      className="cursor-pointer rounded-md px-2 py-1.5 text-left text-sm text-black/45 transition-colors hover:bg-black/[0.03] hover:text-black/70"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1 border-t border-black/8 p-3">
          {[[Settings, "Settings"], [HelpCircle, "Help"], [Trash2, "Trash"]].map(([Icon, label]) => (
            <button
              key={label}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-black/45 transition-colors hover:bg-black/[0.03]"
              title={collapsed ? label : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && label}
            </button>
          ))}
          <div className="mt-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-black text-xs text-white">A</span>
            {!collapsed && <span className="truncate text-sm text-black/60">Abdiaziz</span>}
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-black/8 bg-white px-6 py-3">
          <div className="flex flex-col">
            <span className="text-lg font-medium">Today</span>
            <span className="text-xs text-black/40">Tuesday, 2 September</span>
          </div>
          <div className="flex items-center gap-3">
            {ongoing && (
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{ background: `${ACCENT}14`, color: ACCENT }}
              >
                <CircleDot className="size-3" /> {ongoing.name} running
              </span>
            )}
            <button className="cursor-pointer rounded-full border border-black/10 px-4 py-1.5 text-sm transition-colors hover:bg-black/[0.03]">
              End the day
            </button>
          </div>
        </header>

        <div className={`flex min-h-0 flex-1 ${variant === "rail" ? "flex-row" : "flex-col"}`}>
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-5">
            {variant === "strip" && (
              <BlockStrip blocks={live} onStart={start} onSkip={skip} />
            )}

            {/* Kanban — 4/6 of the vertical split */}
            <section className="flex min-h-0 flex-[4] flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <h2 className="text-sm font-medium">Today&apos;s tasks</h2>
                <span className="text-xs text-black/35">
                  pooled from every block that&apos;s running today
                </span>
              </div>
              <div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
                {COLUMNS.map(([key, label]) => (
                  <div key={key} className="flex min-h-0 flex-col gap-2 rounded-2xl bg-black/[0.03] p-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-medium text-black/55">{label}</span>
                      <span className="text-xs text-black/30">
                        {tasks.filter((t) => t.status === key).length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 overflow-y-auto">
                      {tasks.filter((t) => t.status === key).map((t) => (
                        <div
                          key={t.block + t.name}
                          className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                        >
                          <span className={`text-sm ${key === "done" ? "text-black/35 line-through" : ""}`}>
                            {t.name}
                          </span>
                          {/* the block is a spine on the card, never a column */}
                          <span className="flex items-center gap-1.5 text-[11px] text-black/40">
                            <span
                              className="size-1.5 rounded-full"
                              style={{ background: t.block === ongoing?.name ? ACCENT : "#00000025" }}
                            />
                            {t.block}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Timebox — 2/6 */}
            <section className="flex flex-[2] flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <h2 className="text-sm font-medium">Timebox</h2>
                <span className="text-xs text-black/35">where the blocks sit, when they have a time</span>
              </div>
              <div className="relative flex-1 overflow-hidden rounded-2xl bg-white p-3">
                <div className="relative h-full min-h-20">
                  {TIMEBOX.map((t) => (
                    <div
                      key={t.label}
                      className={`absolute top-0 flex h-full items-center rounded-lg px-3 text-xs ${t.tone}`}
                      style={{
                        left: `${((t.start - 6) / 18) * 100}%`,
                        width: `${(t.span / 18) * 100}%`,
                        background: t.tone.includes("bg-") ? undefined : ACCENT,
                      }}
                    >
                      <span className="truncate">{t.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-black/25">
                  {["6am", "10am", "2pm", "6pm", "10pm"].map((h) => <span key={h}>{h}</span>)}
                </div>
              </div>
            </section>
          </div>

          {/* Right rail */}
          {variant === "rail" && (
            <aside className="flex w-72 shrink-0 flex-col gap-4 border-l border-black/8 bg-white p-4">
              <DayProgress blocksDone={blocksDone} doneCount={doneCount} ongoing={ongoing} />
              <div className="h-px bg-black/8" />
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Your blocks</span>
                {live.map((b, i) => (
                  <BlockCard key={b.name} b={b} onStart={() => start(i)} onSkip={() => skip(i)} />
                ))}
                <button className="mt-1 rounded-xl border border-dashed border-black/15 py-2 text-sm text-black/40 transition-colors hover:border-black/30 hover:text-black/60">
                  Add a block
                </button>
              </div>
            </aside>
          )}
        </div>

        {variant === "strip" && (
          <div className="border-t border-black/8 bg-white px-5 py-3">
            <DayProgress inline blocksDone={blocksDone} doneCount={doneCount} ongoing={ongoing} />
          </div>
        )}
      </div>
    </div>
  );
}

function DayProgress({ blocksDone, doneCount, ongoing, inline }) {
  return (
    <div className={inline ? "flex items-center gap-6" : "flex flex-col gap-3"}>
      <div className="flex items-center gap-3">
        <MiloFace
          mood={ongoing ? "focused" : "content"}
          className="size-10 shrink-0 touch-none select-none"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium">Where you are</span>
          <span className="text-xs text-black/40">not how far behind</span>
        </div>
      </div>
      <div className={inline ? "flex gap-6" : "grid grid-cols-3 gap-2"}>
        {[[blocksDone, "blocks"], [doneCount, "things"], ["2h 14m", "focus"]].map(([n, l]) => (
          <div key={l} className="flex flex-col">
            <span className="text-xl font-medium tabular-nums">{n}</span>
            <span className="text-[11px] text-black/40">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockCard({ b, onStart, onSkip }) {
  const ongoing = b.status === "ongoing";
  const done = b.status === "done";
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border p-3 transition-colors"
      style={{
        borderColor: ongoing ? `${ACCENT}40` : "#00000012",
        background: ongoing ? `${ACCENT}08` : "#fff",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm font-medium ${done ? "text-black/40" : ""}`}>{b.name}</span>
        <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] text-black/45">{b.category}</span>
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-black/40">
        <span>ran {b.ran}×</span>
        <div className="flex items-center gap-1">
          {!done && (
            <>
              <button
                onClick={onSkip}
                className="cursor-pointer rounded-md p-1 transition-colors hover:bg-black/5"
                title="Skip — leaves no mark"
              >
                <SkipForward className="size-3.5" />
              </button>
              <button
                onClick={onStart}
                className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-white transition-opacity hover:opacity-85"
                style={{ background: ACCENT }}
              >
                {ongoing ? <Pause className="size-3" /> : <Play className="size-3" />}
                {ongoing ? "Pause" : b.status === "paused" ? "Resume" : "Start"}
              </button>
            </>
          )}
          {done && <span className="flex items-center gap-1 text-emerald-600"><Sparkles className="size-3" />done</span>}
        </div>
      </div>
    </div>
  );
}

function BlockStrip({ blocks, onStart, onSkip }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-medium">Your blocks</h2>
        <span className="text-xs text-black/35">one runs at a time</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {blocks.map((b, i) => (
          <div key={b.name} className="w-56 shrink-0">
            <BlockCard b={b} onStart={() => onStart(i)} onSkip={() => onSkip(i)} />
          </div>
        ))}
        <button className="flex w-40 shrink-0 items-center justify-center rounded-xl border border-dashed border-black/15 text-sm text-black/40 transition-colors hover:border-black/30">
          <Clock className="mr-1.5 size-3.5" /> Add a block
        </button>
      </div>
    </section>
  );
}
