// Light or dark for the landing page, set from the hero board's toggle. Held in memory only: a reload starts light.

import { useSyncExternalStore } from "react";

let dark = false;
const listeners = new Set();

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function setLandingDark(next) {
  dark = next;
  listeners.forEach((fn) => fn());
}

export function useLandingDark() {
  return useSyncExternalStore(subscribe, () => dark, () => false);
}
