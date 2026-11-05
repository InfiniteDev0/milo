"use client";

// Shows its children only on one of the two views (the Tasks | Blocks tabs in
// the top bar), and nothing on the other.

import { usePreference } from "@/hooks/use-preference";
import { VIEW } from "@/lib/view";
import { useMounted } from "@/hooks/use-mounted";

// nothing until the saved view is known, so a refresh never flashes the other view first
export function ViewOnly({ view, children }) {
  const current = usePreference(VIEW);
  const mounted = useMounted();
  return mounted && current === view ? children : null;
}
