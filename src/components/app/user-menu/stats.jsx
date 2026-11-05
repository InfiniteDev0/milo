"use client";

/* Under your card in the account menu: two counts side by side, then the
   Leaderboard button with your place on it.

     ⚡  tasks you ticked done this week
     💎  notes you've written

   Both are real counts from your data (db/stats.js), read each time the menu
   opens. A failed read shows a dash, never a zero.

   Your place is a PLACEHOLDER (SAMPLE_PLACE), asked for so the row looks right:
   it is not computed from anything. It has to be replaced before anyone else
   uses Milo — a real place needs a server-side function that shares only
   scores (RLS keeps everyone's data private) and a decision on who's ranked. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gem, Zap } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { readStats } from "@/lib/db/stats";
import { cn } from "@/lib/utils";
import { Tip } from "../tasks-view/tip";
import { ROW_CLASS } from "./rows";
import { StarBadge } from "../icons/star-badge";

// not real: see above
const SAMPLE_PLACE = 1500;

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
      <DropdownMenuItem
        render={<Link href="/leaderboard" />}
        className={cn(ROW_CLASS, "bg-muted/60 dark:bg-white/[0.06]")}
      >
        <StarBadge className="size-[18px] shrink-0" />
        <span className="min-w-0 flex-1 truncate">Leaderboard</span>
        <span className="shrink-0 text-sm font-semibold text-muted-foreground tabular-nums">#{SAMPLE_PLACE.toLocaleString()}</span>
      </DropdownMenuItem>
    </div>
  );
}
