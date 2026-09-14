"use client";

// next-themes was already a dependency and sonner was already calling useTheme()
// with no provider above it. This is that provider.

import { ThemeProvider as NextThemes } from "next-themes";

export function ThemeProvider({ children }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="light"
      enableSystem
      // the palette is flat colour, nothing to cross-fade, and the transition
      // would show as a wash down the page
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
