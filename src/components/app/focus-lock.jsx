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
import MiloFace from "@/components/MiloFace";
import { useBlocks } from "./blocks-provider";

// the lock as the avatar menu uses it: on, off, and whether there is anything to lock onto
export function useFocusLock() {
  const { focusLocked, toggleFocusLock, ongoing } = useBlocks();

  /* Only the lock is announced. Unlocking is a return to normal and needs
     no confirmation — a toast for every state change is noise. */
  const toggle = () => {
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

  // nothing to lock onto until a block is running
  return { locked: focusLocked, disabled: !ongoing, toggle };
}
