"use client";

// A tour in four tabs: pick one and its words and its picture swap in.

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DayColumn, NoteCard, TaskCard } from "./mocks";
import { DAYS, NOTES } from "./data";
import { Phone } from "./phone";

const BLOCKS = [
  { name: "Work", bg: "#e9e0ff", ink: "#4512b8", tasks: [{ title: "Draft the Q1 plan", label: "Work", time: "10:00" }, { title: "Team review", label: "Work", time: "14:00" }] },
  { name: "Home", bg: "#dff5e9", ink: "#0b7a4b", tasks: [{ title: "Water the plants", label: "Home" }, { title: "Call Mum", label: "Home", done: true }] },
];

const TABS = [
  {
    key: "tasks",
    title: "Tasks",
    head: "A column for every day",
    text: "Today sits beside the days around it. Give a task a time, a label in your own colour, or let it repeat. Each day shows how many you have and how many are done — never how many you missed.",
    picture: () => (
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <DayColumn {...DAYS[1]} />
        <div className="hidden sm:flex"><DayColumn {...DAYS[2]} /></div>
      </div>
    ),
  },
  {
    key: "notes",
    title: "Notes",
    head: "Notes that look like something",
    text: "Write on a clean page that saves as you type. Give it a cover, file it under a block, and find it again from anywhere with search.",
    picture: () => (
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {NOTES.map((n) => <NoteCard key={n.title} {...n} />)}
      </div>
    ),
  },
  {
    key: "blocks",
    title: "Blocks",
    head: "Sorted by what your life is made of",
    text: "Switch Home from days to blocks and the same tasks line up by Work, Home, Health — whatever yours are. Notes file under the same blocks, so a plan and its notes live together.",
    picture: () => (
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {BLOCKS.map((b) => (
          <div key={b.name} className="flex flex-col gap-2">
            <span className="w-fit rounded-lg px-2.5 py-1 text-xs" style={{ background: b.bg, color: b.ink }}>{b.name}</span>
            {b.tasks.map((t) => <TaskCard key={t.title} {...t} />)}
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "phone",
    title: "On your phone",
    head: "Made for your thumb, too",
    text: "On a phone, Home and Notes sit in a bar under your thumb with a + beside it for a task or a note. One day fills the screen; swipe to the next. Pull down from the top to search.",
    picture: () => <Phone />,
  },
];

export function Tour() {
  const [on, setOn] = useState(0);
  const tab = TABS[on];
  return (
    <section className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-8 px-3 py-16">
      <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
        <h2 className="text-4xl font-light tracking-tight sm:text-5xl">Two things, done properly</h2>
        <p className="text-black/55 sm:text-lg">No hundred features to learn. Tasks and notes, and the few things that make them work together.</p>
      </div>

      {/* the tabs: one pill under the one you're on */}
      <div role="tablist" className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-[#f4f2ee] p-1 scrollbar-none">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={i === on}
            onClick={() => setOn(i)}
            className={cn("shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm transition-colors", i === on ? "bg-[#5e17eb] text-white" : "text-black/60 hover:text-black")}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div key={tab.key} className="grid w-full animate-in grid-cols-1 items-center gap-8 rounded-[28px] bg-[#f4f2ee] p-6 duration-300 fade-in slide-in-from-bottom-2 md:grid-cols-[2fr_3fr] md:p-10">
        <div className="flex flex-col gap-3 text-center md:text-left">
          <h3 className="text-2xl font-normal sm:text-3xl">{tab.head}</h3>
          <p className="text-black/55">{tab.text}</p>
        </div>
        <div className="flex justify-center rounded-[22px] bg-white p-5">{tab.picture()}</div>
      </div>
    </section>
  );
}
