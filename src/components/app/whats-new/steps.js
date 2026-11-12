"use client";

// The "What's new" steps for this update. Each ticks itself when it's actually done somewhere in the
// app (markStep), never by clicking the list. A step can be skipped, and × ends the tour; once it's done
// or ended it never shows again. To show a new update's steps, change VERSION and the STEPS — it shows
// once more for everyone. That's how every update is introduced from now on.

export const VERSION = "nov-11b-2026";

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
    id: "label-colour",
    title: "Colour a label",
    hint: "On a task, open its label, then pick a colour just above New category.",
    // the whole of today stays clear, so Add a task and the rest keep working through the step
    targets: ["today", ...WAY_HOME],
    point: [...ON_TODAY("label-button"), TODAY_CARD, ...WAY_HOME],
  },
  {
    id: "notes-sidebar",
    title: "Fold the Notes sidebar",
    hint: "In Notes, press « at the top of the left side (or Ctrl+\\). » at the top of the rail opens it again.",
    targets: ["notes-sidebar", ...WAY_TO_NOTES],
    point: ["notes-sidebar", ...WAY_TO_NOTES],
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
