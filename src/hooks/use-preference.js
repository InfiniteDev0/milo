"use client";

// A device setting, live: every part of the app that reads it follows the moment it changes.

import { useSyncExternalStore } from "react";

export function usePreference(pref) {
  return useSyncExternalStore(pref.subscribe, pref.get, () => pref.fallback);
}
