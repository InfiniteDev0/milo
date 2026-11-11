"use client";

// Themes, from the account menu: Appearance (light, dark, or the device's) as pictures, then the
// theme colour, which paints the app's strong buttons. Both stay on this device.

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { usePreference } from "@/hooks/use-preference";
import { THEME_COLOURS, THEME_COLOUR } from "@/lib/theme-colour";
import { cn } from "@/lib/utils";
import { ThemePreview } from "./theme-preview";

const MODES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Auto" },
];
const HEAD = "text-sm font-medium text-muted-foreground";
const noop = () => () => {};

export function ThemesDialog({ open, onOpenChange }) {
  const { theme, setTheme } = useTheme();
  // next-themes only knows the choice once on the page
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const colour = usePreference(THEME_COLOUR);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* small, as ClickUp's, and no edge: the shadow lifts it */}
      <DialogContent className="flex flex-col gap-4 p-5 ring-0 shadow-2xl sm:max-w-[26rem]">
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-lg">Themes</DialogTitle>
          <DialogDescription>How Milo looks on this device.</DialogDescription>
        </div>

        <section className="flex flex-col gap-2.5">
          <h3 className={HEAD}>Appearance</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {MODES.map((m) => {
              const on = ready && theme === m.value;
              return (
                <button key={m.value} type="button" onClick={() => setTheme(m.value)} aria-pressed={on} className="flex cursor-pointer flex-col items-center gap-2">
                  <span className={cn("block w-full overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-popover transition-shadow", on ? "ring-foreground" : "ring-transparent")}>
                    <ThemePreview theme={m.value} />
                  </span>
                  <span className={cn("text-sm", on ? "font-semibold" : "text-muted-foreground")}>{m.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2.5">
          <h3 className={HEAD}>Theme colour</h3>
          <div className="grid grid-cols-3 gap-2">
            {THEME_COLOURS.map((c) => {
              const on = colour === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => THEME_COLOUR.set(c.id)}
                  aria-pressed={on}
                  className={cn(
                    // filled, no edge: only the picked one is outlined
                    "flex h-10 cursor-pointer items-center gap-2.5 rounded-lg bg-foreground/5 px-3 text-sm ring-inset transition-colors",
                    on ? "font-medium ring-2 ring-foreground/70" : "text-foreground/75 hover:bg-foreground/8 hover:text-foreground",
                  )}
                >
                  {/* black is the app's own: dark in light mode, light in dark mode */}
                  <span className={cn("flex size-4.5 shrink-0 items-center justify-center rounded-md", !c.hex && "bg-foreground")} style={c.hex ? { background: c.hex } : undefined}>
                    {on && <Check className={cn("size-3", c.hex ? "text-white" : "text-background")} strokeWidth={3} />}
                  </span>
                  {c.label}
                </button>
              );
            })}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
