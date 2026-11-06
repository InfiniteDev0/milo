"use client";

/* Under your card in the account menu: two counts side by side, then the
   Leaderboard button with your place on it.

     ⚡  tasks you ticked done this week
     💎  notes you've written

   Both are real counts from your data (db/stats.js), read each time the menu
   opens. A failed read shows a dash, never a zero.

   The Leaderboard row is marked Soon (6 Nov): there is no points system or
   ranking yet, so no place is shown — a made-up number would mislead. */

import { useEffect, useState } from "react";
import { Gem, Zap } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { readStats } from "@/lib/db/stats";
import { cn } from "@/lib/utils";
import { Tip } from "../tasks-view/tip";
import { ROW_CLASS } from "./rows";
import { StarBadge } from "../icons/star-badge";


function Count({ icon: Icon, colour, value, label }) {
  return (
    <Tip label={label}>
      <div className="flex h-11 items-center justify-center gap-2.5">
        <span className="flex size-6 items-center justify-center rounded-full" style={{ background: `${colour}26` }}>
          <Icon className="size-3.5" style={{ color: colour, fill: colour }} />
        </span>
        <span className="text-[15px] font-semibold tabular-nums">{value}</span>
      </div>
    </Tip>
  );
}

export function MenuStats() {
  // undefined while it loads, null if it couldn't
  const [stats, setStats] = useState(undefined);

  useEffect(() => {
    let alive = true;
    readStats()
      .then((s) => alive && setStats(s))
      .catch((err) => {
        if (alive) setStats(null);
        console.warn("[milo] could not read your counts", err);
      });
    return () => {
      alive = false;
    };
  }, []);

  const show = (n) => (stats === undefined ? "…" : stats === null ? "—" : n);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 divide-x divide-border rounded-sm border border-border">
        <Count icon={Zap} colour="#7c5cff" value={show(stats?.done)} label="Tasks done this week" />
        <Count icon={Gem} colour="#f5a524" value={show(stats?.notes)} label="Notes written" />
      </div>
      {/* the leaderboard is coming: no rank is shown until there's a real one (no points system yet) */}
      <DropdownMenuItem disabled className={cn(ROW_CLASS, "cursor-default bg-muted/60 text-foreground/50 dark:bg-white/[0.06]")}>
        <StarBadge className="size-[18px] shrink-0 opacity-60" />
        <span className="min-w-0 flex-1 truncate">Leaderboard</span>
        <span className="shrink-0 rounded-sm bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Soon</span>
      </DropdownMenuItem>
    </div>
  );
}
