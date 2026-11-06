"use client";

// The "What's new" steps for this update. Each ticks itself when it's actually done somewhere in the
// app (markStep), never by clicking the list. A step can be skipped, and × ends the tour; once it's done
// or ended it never shows again. To show a new update's steps, change VERSION and the STEPS — it shows
// once more for everyone. That's how every update is introduced from now on.

export const VERSION = "nov-2026";

// targets: the places the spotlight keeps clear for this step, tried in order — a data-tour name, or a
// selector — so a step on another page first points at the way there (Home or Notes in the sidebar,
// or the Tasks toggle). point: the exact thing to press, in the order they come — the pointer taps the
// first one on screen, so it moves on as you go (the 0:00, then ▶ once it opens). Falls back to targets.
// hint: how to do it, in one line, under the step
const TODAY_CARD = '[data-tour="today"] [data-task-card]';
const ON_TODAY = (...names) => names.map((n) => `[data-tour="today"] [data-tour="${n}"]`);
const WAY_HOME = ["switch-view", "nav-home"];
const WAY_TO_NOTES = ["notes-all", "nav-notes"];

export const STEPS = [
  {
    id: "switch-view",
    title: "Switch Tasks and Blocks, top right",
    hint: "Click Blocks at the top right, then Tasks to come back.",
    targets: WAY_HOME,
    // the tab you're not on, not the middle of the toggle
    point: ['[data-tour="switch-view"] [role="tab"][aria-selected="false"]', ...WAY_HOME],
  },
  {
    id: "add-day-task",
    title: "Add a task to a day",
    hint: "Click Add a task in today's column, type a name, press Enter.",
    targets: ["today", ...WAY_HOME],
    point: [...ON_TODAY("draft-input", "add-task"), ...WAY_HOME],
  },
  {
    id: "set-estimate",
    title: "Give a task a time estimate",
    hint: "Click the 0:00 on a task, then Estimated, and pick how long it should take.",
    targets: [TODAY_CARD, "today", ...WAY_HOME],
    point: [...ON_TODAY("estimate", "time-pill", "add-task"), ...WAY_HOME],
  },
  {
    id: "start-timer",
    title: "Start a task's timer",
    hint: "Open the task's time (the 0:00) and press ▶.",
    targets: [TODAY_CARD, "today", ...WAY_HOME],
    point: [...ON_TODAY("timer-play", "time-pill", "add-task"), ...WAY_HOME],
  },
  {
    id: "use-timer",
    title: "Use the timer, bottom right",
    hint: "Your timer is at the bottom right. Pause it there — or hover it for Done and Stop.",
    targets: ["floating-timer", TODAY_CARD, ...WAY_HOME],
    point: ['[data-tour="floating-timer"] button[aria-label="Pause"]', "floating-timer", ...ON_TODAY("timer-play", "time-pill"), ...WAY_HOME],
  },
  {
    id: "label-task",
    title: "Label a task with a category",
    hint: "Hover a task, click Select label, and pick a category (or make one there).",
    targets: [TODAY_CARD, "today", ...WAY_HOME],
    point: [...ON_TODAY("label-button"), TODAY_CARD, ...WAY_HOME],
  },
  {
    id: "make-category",
    title: "Make a category in Notes",
    hint: "On the Notes page, click Add category, type its name, press Enter.",
    targets: ["categories", ...WAY_TO_NOTES],
    point: ["add-category", ...WAY_TO_NOTES],
  },
  {
    id: "note-in-category",
    title: "Write a note in your category",
    hint: "Click your category's name, then Add a note to it — and write something in it.",
    targets: ["note-editor", "category-view", "categories", ...WAY_TO_NOTES],
    point: ["note-editor", '[data-tour="category-view"] [data-tour="add-note"]', "category-name", ...WAY_TO_NOTES],
  },
  {
    id: "search",
    title: "Find anything with Ctrl K",
    hint: "Click the magnifier at the top, or press Ctrl K anywhere.",
    targets: ["search"],
    point: ["search"],
  },
];

const EVENT = "milo:tour-step";
const REPLAY = "milo:tour-replay";

// Help › Tutorial: the steps again from the start, for anyone, finished or not
export const replayTour = () => window.dispatchEvent(new Event(REPLAY));
export function onReplay(handler) {
  window.addEventListener(REPLAY, handler);
  return () => window.removeEventListener(REPLAY, handler);
}

// call wherever a step is done
export const markStep = (id) => window.dispatchEvent(new CustomEvent(EVENT, { detail: id }));

export function onStep(handler) {
  const listener = (e) => handler(e.detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
