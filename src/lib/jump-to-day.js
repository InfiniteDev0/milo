"use client";

// One part of the app asks the Tasks view to scroll to a day: the top bar's date wheel or the
// search asks, the view listens. A window event, so neither has to hold the other — and, for a
// view that isn't on screen yet (search opening it), the day is kept until it mounts and takes it.

const EVENT = "milo:jump-to-day";

export const jumpToDay = (date) => window.dispatchEvent(new CustomEvent(EVENT, { detail: date }));

let pending = null;
// for when the Tasks view may not be showing yet
export const jumpToDayLater = (date) => {
  pending = date;
  jumpToDay(date);
};
// the day asked for before the view was there, once
export const takePendingDay = () => {
  const d = pending;
  pending = null;
  return d;
};

// returns the unsubscribe
export function onJumpToDay(handler) {
  const listener = (e) => handler(e.detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
