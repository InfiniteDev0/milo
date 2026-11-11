"use client";

// Lays the picked theme colour on the page (data-accent on <html>), and takes it off on the way out.

import { useEffect } from "react";
import { usePreference } from "@/hooks/use-preference";
import { COLOUR_SCRIPT, THEME_COLOUR } from "@/lib/theme-colour";

export function ThemeColourSync() {
  const colour = usePreference(THEME_COLOUR);
  useEffect(() => {
    const html = document.documentElement;
    if (colour === "black") delete html.dataset.accent;
    else html.dataset.accent = colour;
    return () => delete html.dataset.accent;
  }, [colour]);
  // the first paint: set before React wakes up
  return <script dangerouslySetInnerHTML={{ __html: COLOUR_SCRIPT }} />;
}
