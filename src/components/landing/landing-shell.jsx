"use client";

// Wraps the public site so the landing page can go dark from the hero board's toggle. Only "/": the other pages are
// drawn for light and stay light.

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLandingDark } from "./landing-theme";

export function LandingShell({ children }) {
  const path = usePathname();
  const dark = useLandingDark() && path === "/";
  return <div className={cn("min-h-screen bg-background text-foreground", dark && "dark")}>{children}</div>;
}
