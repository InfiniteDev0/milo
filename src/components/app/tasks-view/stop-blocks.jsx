"use client";

// Blocks only run while you're on Home's Blocks view: switching to Tasks, or going
// to any other page (Notes, Journal, Settings…), pauses the running block, so its
// clock stops and its check-ins go quiet. It keeps its time and picks up from the
// Blocks view whenever you start it again.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePreference } from "@/hooks/use-preference";
import { VIEW } from "@/lib/view";
import { useMounted } from "@/hooks/use-mounted";
import { useBlocks } from "../blocks-provider";

export function StopBlocksInTasksView() {
  const view = usePreference(VIEW);
  const { ongoing, start } = useBlocks();
  // Home itself; its Month and Year pages are somewhere else
  const onHome = usePathname() === "/daily";
  // the saved view reads as the default for a moment on load; act only on the real one
  const mounted = useMounted();

  // start() on the running block is its pause, the same as its pause button
  useEffect(() => {
    if (mounted && (view === "tasks" || !onHome) && ongoing) start(ongoing.id);
  }, [mounted, view, onHome, ongoing, start]);

  return null;
}
