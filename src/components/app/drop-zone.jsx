"use client";

/* Drag a block toward the bottom and this rises up to meet you — the Instagram
 * drag-to-remove gesture, with an eraser instead of an X.
 *
 * Dropping is for today only. It is the honest version of "I can't do all five
 * of these", and it costs nothing: nothing is recorded, nothing is counted, and
 * you can pick the block back up whenever you want it. Tomorrow they're all
 * back on their own.
 */

import { toast } from "sonner";
import MiloFace from "@/components/MiloFace";
import { useBlocks } from "./blocks-provider";

function EraserIcon(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        fill="#79ee8d"
        d="M3.3352 24.6815c-1.1203 1.4602 -1.071 3.3159 0.1029 4.7361 2.2123 2.6763 4.6814 5.141 7.1843 7.5433 0.5916 0.568 1.3883 0.8661 2.2082 0.8423 2.7935 -0.0807 7.4652 -0.1637 14.8737 -0.1637 0.5148 0 1.0119 -0.1893 1.393 -0.5353 5.1437 -4.6694 10.2891 -9.5445 14.5237 -15.0636 1.1203 -1.4603 1.071 -3.3161 -0.1029 -4.7361 -4.0441 -4.8922 -8.7865 -9.4861 -13.7963 -13.3829 -1.4641 -1.1388 -3.3771 -1.1866 -4.8825 -0.0998 -8.0216 6.2885 -15.1705 13.4826 -21.5041 20.8597Z"
      />
      <path
        fill="#0c098c"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.9295 25.9646c6.2481 -7.2726 13.2753 -14.3379 21.1351 -20.5044 0.7526 -0.5269 1.6536 -0.5058 2.4014 0.0759 4.893 3.8059 9.5278 8.2957 13.4756 13.0715 0.5775 0.6985 0.5862 1.4976 0.0566 2.188 -4.1136 5.3615 -9.1392 10.1313 -14.2756 14.7943 0 0 -0.001 0.0009 -0.0038 0.002 -0.0031 0.0011 -0.0079 0.0024 -0.0144 0.0024 -7.4229 0 -12.115 0.083 -14.9329 0.1645 -0.2872 0.0083 -0.5478 -0.096 -0.7328 -0.2734 -2.4899 -2.39 -4.8895 -4.7886 -7.0241 -7.371 -0.5669 -0.6857 -0.5857 -1.4683 -0.0851 -2.1498ZM29.7556 3.8781l1.2219 -1.571C28.8067 0.6186 25.8947 0.5373 23.6421 2.1635c-0.0218 0.0158 -0.0434 0.032 -0.0646 0.0486C15.4265 8.602 8.1822 15.8962 1.7834 23.3492c-0.0244 0.0284 -0.0481 0.0575 -0.0709 0.0873 -1.7111 2.2302 -1.6212 5.1426 0.1492 7.2843 2.2899 2.7702 4.8286 5.3009 7.3444 7.7158 0.9985 0.9583 2.3312 1.4503 3.6836 1.4112 2.7692 -0.0801 7.4205 -0.1628 14.8147 -0.1628 1.0159 0 2.0049 -0.3739 2.7677 -1.0664 5.1508 -4.6759 10.4162 -9.6562 14.7716 -15.3329l-1.6227 -1.2452 1.6227 1.2452c1.7111 -2.2303 1.6213 -5.1427 -0.1492 -7.2843 -4.1401 -5.0086 -8.9903 -9.7066 -14.117 -13.6943l-1.2219 1.571ZM7.8914 41.3844c-1.5532 0 -2.8124 1.2593 -2.8124 2.8124 0 1.5532 1.2592 2.8123 2.8124 2.8123h36.8162c1.5533 0 2.8124 -1.2591 2.8124 -2.8123s-1.2591 -2.8124 -2.8124 -2.8124H7.8914Z"
      />
    </svg>
  );
}

const NUMBER = ["none", "one", "two", "three", "four", "five", "six", "seven", "eight"];

export function DropZone({ draggingId, onDone }) {
  const { dropBlock, blocks, dayBlocks } = useBlocks();

  /* Only rises for a block that could actually be dropped. Showing it for
     a finished block and then refusing the drop would be worse than not
     offering it at all. */
  const dragged = blocks.find((b) => b.id === draggingId) ?? null;
  const dragging = dragged !== null && dragged.status !== "done";
  const handle = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("application/milo-block");
    onDone?.();
    if (!id) return;

    dropBlock(id);

    // count what's left, said as words — a number in a badge reads like a score
    // only blocks with something in them today count as what's left
    const left = dayBlocks.filter((b) => b.id !== id).length;
    toast.custom(
      () => (
        <div className="flex items-center gap-3 rounded-2xl bg-chrome py-2.5 pl-2.5 pr-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip">
            <MiloFace
              mood="content"
              instant
              gaze={false}
              blink={false}
              reactToScroll={false}
              className="size-10"
            />
          </span>
          <div className="flex flex-col">
            <span className="text-sm text-chrome-ink">
              {left > 0
                ? `Just ${NUMBER[left] ?? left} today, then.`
                : "Nothing on today. That's allowed."}
            </span>
            <span className="text-xs text-chrome-ink/45">
              Set aside, not gone. Pick it back up any time.
            </span>
          </div>
        </div>
      ),
      { unstyled: true, id: "milo-drop", duration: 3500 },
    );
  };

  return (
    <div
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("application/milo-block")) return;
        e.preventDefault();
      }}
      onDrop={handle}
      aria-hidden={!dragging}
      className={`fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 transition-all duration-300 ${
        dragging
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-card shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-1 ring-foreground/5">
        <EraserIcon className="size-8" />
      </div>
      <span className="rounded-full bg-foreground/75 px-3 py-1 text-xs text-background">
        Not today
      </span>
    </div>
  );
}
