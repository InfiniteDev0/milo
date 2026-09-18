"use client";

// The notes sheet's place on screen, live: moving it in one tab moves it everywhere.

import { usePreference } from "./use-preference";
import { SHEET_POSITION } from "@/lib/sheet-position";

export function useSheetPosition() {
  return usePreference(SHEET_POSITION);
}
