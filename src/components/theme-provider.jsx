"use client";

// next-themes was already a dependency and sonner was already calling useTheme()
// with no provider above it. This is that provider.

import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemes } from "next-themes";

// the public site and sign-in are always light, whatever the app is set to
const ALWAYS_LIGHT = ["/about", "/pricing", "/features", "/auth", "/signup"];
const isAlwaysLight = (path) => path === "/" || ALWAYS_LIGHT.some((p) => path.startsWith(p));

export function ThemeProvider({ children }) {
  const path = usePathname() ?? "";
  return (
    <NextThemes
      attribute="class"
      defaultTheme="light"
      enableSystem
      forcedTheme={isAlwaysLight(path) ? "light" : undefined}
      // the palette is flat colour, nothing to cross-fade, and the transition
      // would show as a wash down the page
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
