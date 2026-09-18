"use client";

// The spelling-underline setting, live: every editor follows it the moment it changes.

import { usePreference } from "./use-preference";
import { SPELLCHECK } from "@/lib/spellcheck";

export function useSpellcheck() {
  return usePreference(SPELLCHECK) === "on";
}
