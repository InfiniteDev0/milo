"use client";

// The "What's new" steps for this update. Each ticks itself when it's actually done somewhere in the
// app (markStep), never by clicking the list. They're mandatory: the list can't be put away until all are
// done, and then it never shows again. To show a new update's steps, change VERSION and the STEPS — it
// shows once more for everyone. That's how every update is introduced from now on.

export const VERSION = "nov-2026";

export const STEPS = [
  { id: "switch-view", title: "Switch Tasks and Blocks, top right" },
  { id: "add-day-task", title: "Add a task to a day" },
  { id: "start-timer", title: "Start a task's timer" },
  { id: "label-task", title: "Label a task with a category" },
  { id: "make-category", title: "Make a category in Notes" },
  { id: "search", title: "Find anything with Ctrl K" },
];

const EVENT = "milo:tour-step";

// call wherever a step is done
export const markStep = (id) => window.dispatchEvent(new CustomEvent(EVENT, { detail: id }));

export function onStep(handler) {
  const listener = (e) => handler(e.detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
