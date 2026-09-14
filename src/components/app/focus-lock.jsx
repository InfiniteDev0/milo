"use client";

/* Focus lock.
 *
 * Locked, the lineup shows only the block you're in — the rest go away. Seeing
 * the whole day at once is what turns a list into a demand ("when am I going to
 * finish all this"), and POSITIONING is explicit that the app never presents it
 * that way. This is the release valve.
 *
 * It unlocks itself when the block finishes, and it can always be unlocked by
 * hand. A lock you can't open is coercion, which is the thing we refuse — you
 * are never trapped in a block.
 */

import { toast } from "sonner";
import { Lock } from "@/components/animate-ui/icons/lock";
import { LockOpen } from "@/components/animate-ui/icons/lock-open";
import MiloFace from "@/components/MiloFace";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBlocks } from "./blocks-provider";

export function FocusLock() {
  const { focusLocked, toggleFocusLock, ongoing } = useBlocks();

  /* Only the lock is announced. Unlocking is a return to normal and needs
     no confirmation — a toast for every state change is noise. */
  const onClick = () => {
    const locking = !focusLocked;
    toggleFocusLock();
    if (!locking || !ongoing) return;

    toast.custom(
      () => (
        <div className="flex items-center gap-3 rounded-2xl bg-chrome py-2.5 pl-2.5 pr-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip">
            <MiloFace
              mood="focused"
              instant
              gaze={false}
              blink={false}
              reactToScroll={false}
              className="size-10"
            />
          </span>
          <div className="flex flex-col">
            <span className="text-sm text-chrome-ink">
              Locked in on {ongoing.name.replace(" Block", "")}.
            </span>
            <span className="text-xs text-chrome-ink/45">
              The rest of the day can wait.
            </span>
          </div>
        </div>
      ),
      { unstyled: true, id: "milo-focus", duration: 3000 },
    );
  };

  // Nothing to lock onto until a block is running.
  const disabled = !ongoing;

  const help = disabled
    ? "Start a block first"
    : focusLocked
      ? "Show the whole lineup again"
      : "Hide every other block until this one is done";

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={onClick}
              disabled={disabled}
              aria-pressed={focusLocked}
              aria-label={focusLocked ? "Unlock focus" : "Lock focus on this block"}
            />
          }
          style={{ "--lift": "var(--card-lift)" }}
          className="milo-lift group flex size-12 cursor-pointer items-center justify-center rounded-xl border border-foreground/10 bg-card transition-colors disabled:cursor-default disabled:border-foreground/5 disabled:shadow-none"
        >
          {/* one shackle path: open is pathLength 0.8, closed is 1 */}
          {focusLocked ? (
            <Lock size={20} className={
              disabled
                ? "text-foreground/30"
                : focusLocked
                  ? "text-foreground"
                  : "text-foreground/60 transition-colors group-hover:text-foreground"
            } />
          ) : (
            <LockOpen size={20} className={
              disabled
                ? "text-foreground/30"
                : focusLocked
                  ? "text-foreground"
                  : "text-foreground/60 transition-colors group-hover:text-foreground"
            } />
          )}
        </TooltipTrigger>

        <TooltipContent side="right" sideOffset={14} className="max-w-52">
          <span className="flex flex-col gap-0.5">
            <span className="font-medium">
              {focusLocked ? "Focus locked" : "Focus"}
            </span>
            <span className="opacity-70">{help}</span>
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
