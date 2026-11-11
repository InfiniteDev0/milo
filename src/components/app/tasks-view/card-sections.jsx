"use client";

// What a task card opens into: the time (a play button and Estimated), its subtasks, and a note.
// Each sits under a thin line.

import { useState } from "react";
import { Pause, Play, Plus, X } from "lucide-react";
import { presetLabel } from "@/lib/duration";
import { cn } from "@/lib/utils";
import { Strike } from "../strike";
import { Tick } from "../task-bits";
import { InlineName } from "./inline-name";
import { TimePicker } from "./time-picker";

const SECTION = "-mx-3 border-t border-foreground/10 px-3 pt-2";

function Column({ label, value, strong, onPick, tour }) {
  return (
    <TimePicker
      onPick={onPick}
      trigger={
        <button type="button" data-tour={tour} className="flex cursor-pointer flex-col items-end rounded-sm px-1.5 py-0.5 hover:bg-muted">
          <span className={cn("text-xs", strong ? "text-foreground" : "text-muted-foreground")}>{label}</span>
          <span className={cn("text-xs tabular-nums", strong ? "text-foreground" : "text-muted-foreground")}>{value}</span>
        </button>
      }
    />
  );
}

// play starts the clock on this task; Actual is the time on it, Estimated your guess
// only open while you're setting the time: starting the clock closes it, and the card's own
// play / pause beside its time takes over from there. The estimate reads "5 min", never "0h 5m"
export function TimeSection({ running, minutes, onPlay, onEstimate }) {
  return (
    <div className={cn(SECTION, "flex items-center gap-2")}>
      <button
        type="button"
        onClick={onPlay}
        aria-label={running ? "Pause the clock" : "Start the clock"}
        data-tour="timer-play"
        className="flex size-7 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {running ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      <span className="flex-1" />
      <Column label="Estimated" value={minutes ? presetLabel(minutes) : "None"} strong={Boolean(minutes)} onPick={onEstimate} tour="estimate" />
    </div>
  );
}

// black with white text in dark mode, white with black in light, as the step count and Done read
const INVERT = "rounded-sm bg-white text-black dark:bg-black dark:text-white";

// how far through its subtasks; nothing when there are none
export function StepCount({ steps }) {
  if (!steps.length) return null;
  const ticked = steps.filter((s) => s.done).length;
  return (
    <span className={`ms-auto shrink-0 px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${INVERT}`}>
      {ticked}/{steps.length}
    </span>
  );
}

// The subtasks stay on the card once it has some. "adding" shows Add subtask
// under them; Done puts that away again and leaves the list where it is.
export function SubtasksSection({ steps, onChange, adding = true, onDone }) {
  const [draft, setDraft] = useState("");
  // the step whose name is being fixed (double-click it)
  const [editing, setEditing] = useState(null);

  return (
    <div className={cn(SECTION, "flex flex-col gap-1")}>
      {steps.map((step) => (
        <div key={step.id} className="group/step flex items-center gap-2 py-0.5">
          <Tick
            done={step.done}
            onToggle={() => onChange(steps.map((s) => (s.id === step.id ? { ...s, done: !s.done } : s)))}
            className="size-3.5"
          />
          <InlineName
            value={step.name}
            editing={editing === step.id}
            onEdit={() => setEditing(step.id)}
            onSave={(name) => onChange(steps.map((s) => (s.id === step.id ? { ...s, name } : s)))}
            onStop={() => setEditing(null)}
            className={cn("min-w-0 flex-1 text-xs [overflow-wrap:anywhere]", step.done && "text-foreground/35")}
            inputClassName="min-w-0 flex-1 text-xs"
          >
            <Strike id={step.id} done={step.done}>{step.name}</Strike>
          </InlineName>
          <button
            type="button"
            onClick={() => onChange(steps.filter((s) => s.id !== step.id))}
            aria-label={`Remove ${step.name}`}
            className="cursor-pointer text-foreground/0 transition-colors group-hover/step:text-foreground/30 hover:!text-foreground/70"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
      {adding && (
      <label className="flex items-center gap-2 py-0.5 text-muted-foreground">
        <Plus className="size-3.5 shrink-0" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onChange([...steps, { id: crypto.randomUUID(), name: draft.trim(), done: false }]);
              setDraft("");
            }
          }}
          placeholder="Add subtask"
          aria-label="Add subtask"
          className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
        {onDone && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDone();
            }}
            className={`shrink-0 cursor-pointer px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-85 ${INVERT}`}
          >
            Done
          </button>
        )}
      </label>
      )}
    </div>
  );
}

export function NoteSection({ note, onChange }) {
  return (
    <div className={SECTION}>
      <textarea
        autoFocus={!note}
        value={note ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="Add a note…"
        aria-label="Note"
        className="field-sizing-content min-h-10 w-full resize-none bg-transparent text-xs outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
