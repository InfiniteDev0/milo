"use client";

// Tasks or Blocks, as beui's segment tabs, at the end of the top bar. Only on the home page:
// it switches how that page shows your day, and means nothing on Notes, Journal or the rest.

import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { usePreference } from "@/hooks/use-preference";
import { VIEW } from "@/lib/view";
import { useMounted } from "@/hooks/use-mounted";
import { usePathname } from "next/navigation";
import { markStep } from "./whats-new/steps";

// shorter than beui's default, so the bar keeps room above and below
const TAB = "px-3 py-1 text-[13px]";

export function ViewTabs() {
  const view = usePreference(VIEW);
  // hidden (but holding its place) until the saved choice is known — the server can't see
  // it, so it would draw Tasks and then slide over to your real choice after a refresh
  const mounted = useMounted();
  if (usePathname() !== "/daily") return null;

  return (
    <div className={mounted ? undefined : "invisible"}>
    <Tabs
      value={view}
      onValueChange={(v) => {
        VIEW.set(v);
        markStep("switch-view");
      }}
      variant="segment"
    >
      <TabsList>
        <TabsTrigger value="tasks" className={TAB}>Tasks</TabsTrigger>
        <TabsTrigger value="blocks" className={TAB}>Blocks</TabsTrigger>
      </TabsList>
    </Tabs>
    </div>
  );
}
