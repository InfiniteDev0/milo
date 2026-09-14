"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeCards } from "./theme-cards";

export function Appearance() {
  /* System is offered but is NOT the default: the provider starts on light,
     because a planner that changes appearance when the sun goes down is making
     a decision nobody asked it to make. */
  const { theme, setTheme } = useTheme();

  // theme is undefined until next-themes reads the stored choice, so a card
  // would show selected and then jump. Nothing is picked until it knows.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <section className="flex flex-col  gap-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-xl">Theme</h2>
        <p className="text-sm text-foreground/40">
          Light, dark, or whatever this device is set to.
        </p>
      </div>

      <ThemeCards value={ready ? theme : null} onChange={setTheme} />
    </section>
  );
}
