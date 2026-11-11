"use client";

/* A block task being written: its name, and under it — as part of Add a task —
   which days it shows up on, then whether it comes back or happens once. Enter
   adds it; Esc, or leaving the card with nothing typed, puts it away. Clicking
   the days or the kind doesn't count as leaving. */

import { useRef, useState } from "react";
import { DayPicker } from "../task-sheet/day-picker";

const KINDS = [
  ["routine", "Comes back", "Part of the block, every day it runs"],
  ["once", "Just once", "Done is done — it leaves the block"],
];

export function BlockDraftCard({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [days, setDays] = useState([]);
  const [kind, setKind] = useState("routine");
  const card = useRef(null);

  const save = () => (name.trim() ? onSave(name.trim(), { days, kind }) : onCancel());

  return (
    <div
      ref={card}
      // leaving the card (not just the name field) is what ends it
      onBlur={(e) => !card.current?.contains(e.relatedTarget) && save()}
      className="flex flex-col gap-2.5 rounded-lg border border-(--theme-accent)/40 bg-card px-3 py-2.5"
    >
      <div className="flex items-center gap-2.5">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
            if (e.key === "Enter" && name.trim()) save();
          }}
          aria-label="Task name"
          placeholder="Task name"
          className="min-w-0 flex-1 rounded-sm border border-dashed border-[#a855f7] bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* which days it shows up — none picked means any day */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-foreground/45">Days</span>
          <span className="text-foreground/30">{days.length === 0 ? "Any day" : null}</span>
        </div>
        <DayPicker days={days} onChange={setDays} compact />
      </div>

      {/* whether it comes back or happens once */}
      <div className="flex gap-2">
        {KINDS.map(([id, label, hint]) => (
          <button
            key={id}
            type="button"
            title={hint}
            onClick={() => setKind(id)}
            className={`flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-xs transition-colors ${
              kind === id ? "bg-foreground/[0.06] text-foreground" : "text-foreground/40 ring-1 ring-foreground/10 hover:text-foreground/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
