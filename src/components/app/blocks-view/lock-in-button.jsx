"use client";

// "Lock in", before the day's Start / Pause: shows only the block that's running
// and hides the rest until you unlock or the block finishes. Nothing to lock onto
// until a block is running. The focus lock Milo always had, given a button here.

import { Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusLock } from "../focus-lock";
import { BOX } from "../view-header";

export function LockInButton() {
  const { locked, disabled, toggle } = useFocusLock();

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled && !locked}
      title={disabled && !locked ? "Start a block to lock in on it" : undefined}
      aria-pressed={locked}
      className={cn(
        BOX,
        "cursor-pointer gap-1.5 font-medium transition-colors disabled:cursor-default disabled:opacity-40",
        locked ? "border-transparent bg-foreground text-background hover:bg-foreground/90" : "hover:bg-muted",
      )}
    >
      {locked ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}
      {locked ? "Locked in" : "Lock in"}
    </button>
  );
}
