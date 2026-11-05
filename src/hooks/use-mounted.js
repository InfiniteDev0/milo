"use client";

// false while the server draws the page and on the first client pass, true after.
// For anything that depends on what only this browser knows (a saved preference),
// so it appears already right instead of drawing the default and then jumping.

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
