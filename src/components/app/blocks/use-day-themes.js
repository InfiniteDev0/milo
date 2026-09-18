"use client";

// Giving a weekday its theme, or taking it away. An emoji is kept while you retype the name.

import { useCallback } from "react";

export function useDayThemes({ setDayThemes }) {
  const setDayTheme = useCallback(
    (dayId, patch) => {
      setDayThemes((prev) => {
        const theme = { name: "", emoji: "", ...prev[dayId], ...patch };
        const next = { ...prev };
        // nothing left in it means no theme
        if (!theme.name.trim() && !theme.emoji) delete next[dayId];
        else next[dayId] = theme;
        return next;
      });
    },
    [setDayThemes],
  );

  const clearDayTheme = useCallback(
    (dayId) =>
      setDayThemes((prev) => {
        const next = { ...prev };
        delete next[dayId];
        return next;
      }),
    [setDayThemes],
  );

  return { setDayTheme, clearDayTheme };
}
