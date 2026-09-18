"use client";

// A weekday's theme as a small pill — "🎬 Media day". Nothing at all for a day without one.

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { todayId } from "@/lib/days";
import { useBlocks } from "./blocks-provider";

// the server can't know your weekday, so it says nothing until the browser does
const noSubscribe = () => () => {};

// `dayId` is "mon"…"sun"; left out, it's today's
export function DayTheme({ dayId, className = "" }) {
  const { dayThemes } = useBlocks();
  const today = useSyncExternalStore(noSubscribe, todayId, () => null);

  const theme = dayThemes[dayId ?? today];
  if (!theme?.name?.trim()) return null;

  return (
    <Link
      href="/settings?tab=week"
      title="Change this in Settings → Week"
      className={`flex w-fit max-w-full items-center gap-1.5 truncate rounded-full bg-foreground/6 px-3 py-1 text-sm text-foreground/75 transition-colors hover:bg-foreground/10 ${className}`}
    >
      {theme.emoji && <span aria-hidden>{theme.emoji}</span>}
      <span className="truncate">{theme.name}</span>
    </Link>
  );
}
