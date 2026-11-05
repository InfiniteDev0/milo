"use client";

// The "What's new" steps for this update. Each ticks itself when it's actually done somewhere in the
// app (markStep), never by clicking the list. They're mandatory: the list can't be put away until all are
// done, and then it never shows again. To show a new update's steps, change VERSION and the STEPS — it
// shows once more for everyone. That's how every update is introduced from now on.

export const VERSION = "nov-2026";

// targets: the data-tour places the spotlight keeps clear for this step, tried in order — so a step
// on another page first points at the way there (Home or Notes in the sidebar, or the Tasks toggle)
export const STEPS = [
  { id: "switch-view", title: "Switch Tasks and Blocks, top right", targets: ["switch-view", "nav-home"] },
  { id: "add-day-task", title: "Add a task to a day", targets: ["today", "switch-view", "nav-home"] },
  { id: "start-timer", title: "Start a task's timer", targets: ["today", "switch-view", "nav-home"] },
  { id: "label-task", title: "Label a task with a category", targets: ["today", "switch-view", "nav-home"] },
  { id: "make-category", title: "Make a category in Notes", targets: ["categories", "notes-all", "nav-notes"] },
  { id: "search", title: "Find anything with Ctrl K", targets: ["search"] },
];

const EVENT = "milo:tour-step";

// call wherever a step is done
export const markStep = (id) => window.dispatchEvent(new CustomEvent(EVENT, { detail: id }));

export function onStep(handler) {
  const listener = (e) => handler(e.detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
