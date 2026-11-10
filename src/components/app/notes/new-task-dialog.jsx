"use client";

/* New task, from a category's Tasks card: everything a task needs in one place.
   Its name, the day it sits on (Today, Tomorrow or any day), a time if it has
   one, how long it should take, its label (this category to start with),
   subtasks and a note. Add task (Enter in the name, or Ctrl Enter anywhere)
   saves it onto that day in Tasks. The form starts fresh each time it opens. */

import { useState } from "react";
import { CalendarDays, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { presetLabel } from "@/lib/duration";
import { cn } from "@/lib/utils";
import { LabelMenu } from "../tasks-view/label-menu";
import { MiniCalendar } from "./mini-calendar";
import { CHIP, CHIP_ON, FIELD, LABEL } from "./new-task-styles";
import { TimeField } from "./time-field";

const ESTIMATES = [15, 30, 45, 60, 90, 120];
// a box to type in: a border (not a ring), so the scrolling column never clips it
const BOX =
  "w-full rounded-lg border border-foreground/12 bg-foreground/4 px-3 outline-none transition-colors placeholder:text-muted-foreground focus:border-[#2f80ed]";
const at = (offset) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
};
const same = (a, b) => a.toDateString() === b.toDateString();

// onCreate(task): resolves true once it's saved, and the dialog closes
function Form({ categoryId, onCreate, onCancel }) {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(at(0));
  const [picking, setPicking] = useState(false);
  const [atTime, setAtTime] = useState(null);
  const [minutes, setMinutes] = useState(null);
  const [label, setLabel] = useState(categoryId);
  const [steps, setSteps] = useState([]);
  const [step, setStep] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const ready = title.trim() !== "" && !saving;
  const otherDay = !same(day, at(0)) && !same(day, at(1));

  const submit = async () => {
    if (!ready) return;
    setSaving(true);
    const ok = await onCreate({
      title: title.trim(),
      day,
      atTime,
      minutes,
      categoryId: label,
      steps: steps.map((name) => ({ name })),
      note: note.trim(),
    });
    if (!ok) setSaving(false);
  };
  const addStep = () => {
    const name = step.trim();
    if (name) setSteps((all) => [...all, name]);
    setStep("");
  };

  return (
    <div
      className="flex min-h-0 flex-col"
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          submit();
        }
      }}
    >
      <div className="flex flex-col gap-1 px-5 pt-5 pb-4">
        <DialogTitle className="text-lg font-semibold">New task</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          It goes on its day in Tasks.
        </DialogDescription>
      </div>

      {/* *:shrink-0: in a column that scrolls, nothing gets squeezed to fit */}
      <div className="scrollbar-pill flex min-h-0 flex-col gap-5 overflow-y-auto px-5 pb-5 *:shrink-0">
        <label className={FIELD}>
          <span className={LABEL}>Name</span>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="What needs doing?"
            aria-label="Task name"
            className={cn(BOX, "h-12 text-base")}
          />
        </label>

        <div className={FIELD}>
          <span className={LABEL}>Day</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDay(at(0))}
              className={cn(CHIP, same(day, at(0)) && CHIP_ON)}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDay(at(1))}
              className={cn(CHIP, same(day, at(1)) && CHIP_ON)}
            >
              Tomorrow
            </button>
            <Popover open={picking} onOpenChange={setPicking}>
              <PopoverTrigger className={cn(CHIP, otherDay && CHIP_ON)}>
                <CalendarDays className="size-3.5" />
                {otherDay
                  ? day.toLocaleDateString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : "Pick a day"}
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={6}
                className="w-auto p-3"
              >
                <MiniCalendar
                  value={day}
                  onPick={(d) => {
                    setDay(d);
                    setPicking(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className={FIELD}>
            <span className={LABEL}>Time</span>
            <TimeField value={atTime} onChange={setAtTime} />
          </div>
          <div className={FIELD}>
            <span className={LABEL}>Label</span>
            <div className="flex h-8 items-center text-sm">
              <LabelMenu value={label} onChange={setLabel} />
            </div>
          </div>
        </div>

        <div className={FIELD}>
          <span className={LABEL}>Estimate</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setMinutes(null)}
              className={cn(CHIP, minutes == null && CHIP_ON)}
            >
              None
            </button>
            {ESTIMATES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                className={cn(CHIP, minutes === m && CHIP_ON)}
              >
                {presetLabel(m)}
              </button>
            ))}
          </div>
        </div>

        <div className={FIELD}>
          <span className={LABEL}>Subtasks</span>
          {steps.length > 0 && (
            <ul className="flex flex-col gap-1">
              {steps.map((s, i) => (
                <li
                  key={i}
                  className="flex h-9 items-center gap-2 rounded-lg bg-foreground/5 ps-3 pe-1 text-sm"
                >
                  <span className="size-3.5 shrink-0 rounded-full border-[1.5px] border-foreground/30" />
                  <span className="min-w-0 flex-1 truncate">{s}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSteps((all) => all.filter((_, j) => j !== i))
                    }
                    aria-label={`Remove ${s}`}
                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="relative">
            <Plus className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={step}
              onChange={(e) => setStep(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                  addStep();
                }
              }}
              onBlur={addStep}
              placeholder="Add a subtask, then Enter"
              aria-label="New subtask"
              className={cn(BOX, "h-9 ps-8 text-sm")}
            />
          </div>
        </div>

        <div className={FIELD}>
          <span className={LABEL}>Note</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Anything to remember about it"
            aria-label="Note"
            className={cn(BOX, "resize-none py-2 text-sm")}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 cursor-pointer rounded-lg px-4 text-sm font-medium transition-colors hover:bg-foreground/8"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!ready}
          className="h-9 cursor-pointer rounded-lg bg-solid px-4 text-sm font-medium text-solid-ink transition-colors hover:bg-solid-hover disabled:cursor-default disabled:opacity-40"
        >
          {saving ? "Adding…" : "Add task"}
        </button>
      </div>
    </div>
  );
}

export function NewTaskDialog({ open, onOpenChange, categoryId, onCreate }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {open && (
          <Form
            categoryId={categoryId}
            onCancel={() => onOpenChange(false)}
            onCreate={async (task) => {
              const ok = await onCreate(task);
              if (ok) onOpenChange(false);
              return ok;
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
