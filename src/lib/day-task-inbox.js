"use client";

// Tasks for a day, asked for from outside the Tasks view (the search's "Add … to today"). They wait
// here until the view is showing and its saved tasks have loaded, then it adds and saves them itself.

const EVENT = "milo:add-day-task";
let waiting = [];

export function addDayTaskSoon(date, title) {
  waiting.push({ date, title });
  window.dispatchEvent(new Event(EVENT));
}

// everything waiting, once
export function takeDayTaskAdds() {
  const all = waiting;
  waiting = [];
  return all;
}

// returns the unsubscribe
export function onDayTaskAdds(handler) {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
