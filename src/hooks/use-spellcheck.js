"use client";

// The spelling-underline setting, live: every editor follows it the moment it changes.

import { useSyncExternalStore } from "react";
import { spellcheckOn, subscribeSpellcheck } from "@/lib/spellcheck";

export function useSpellcheck() {
  return useSyncExternalStore(subscribeSpellcheck, spellcheckOn, () => true);
}
