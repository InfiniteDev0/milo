"use client";

/* Drag a block and a round X rises at the bottom of the screen — the way
 * Vercel's toolbar is hidden. Carry the block near it and the block is pulled
 * in and shrinks; let go and it's set aside. The words "Not today" show as you
 * come close, so the X never reads as delete.
 *
 * Dropping is for today only. It is the honest version of "I can't do all five
 * of these", and it costs nothing: nothing is recorded, nothing is counted, and
 * you can pick the block back up whenever you want it. Tomorrow they're all
 * back on their own.
 */

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import MiloFace from "@/components/MiloFace";
import { useBlocks } from "./blocks-provider";

const NUMBER = ["none", "one", "two", "three", "four", "five", "six", "seven", "eight"];

// how close the pointer is: near starts the pull, over is close enough that letting go counts (drag-follower.jsx pulls at the same distances)
const NEAR = 180;
const OVER = 80;
const SPRING = { type: "spring", stiffness: 420, damping: 28 };

export function DropZone({ draggingId, onDone }) {
  const { dropBlock, blocks, dayBlocks } = useBlocks();
  const disc = useRef(null);
  const [reach, setReach] = useState("far");

  /* Only rises for a block that could actually be dropped. Showing it for
     a finished block and then refusing the drop would be worse than not
     offering it at all. */
  const dragged = blocks.find((b) => b.id === draggingId) ?? null;
  const dragging = dragged !== null && dragged.status !== "done";

  // follow the pointer while a block is carried, to know how close it is to the X
  useEffect(() => {
    if (!dragging) return;
    const track = (e) => {
      if (!disc.current || (e.clientX === 0 && e.clientY === 0)) return;
      const r = disc.current.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY);
      setReach(d < OVER ? "over" : d < NEAR ? "near" : "far");
    };
    document.addEventListener("dragover", track);
    return () => {
      document.removeEventListener("dragover", track);
      setReach("far");
    };
  }, [dragging]);

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
    // the whole circle round the X takes the drop, matching how far the block is pulled in
    <div
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("application/milo-block")) return;
        e.preventDefault();
      }}
      onDrop={handle}
      aria-hidden={!dragging}
      className={`fixed bottom-4 left-1/2 z-50 flex size-40 -translate-x-1/2 items-center justify-center rounded-full ${
        dragging ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <motion.span
        initial={false}
        animate={{ opacity: reach === "far" ? 0 : 1, y: reach === "far" ? 6 : 0 }}
        transition={{ duration: 0.18 }}
        className="absolute top-0 rounded-full bg-foreground/75 px-3 py-1 text-xs whitespace-nowrap text-background"
      >
        Not today
      </motion.span>

      <motion.span
        ref={disc}
        data-drag-magnet={dragging ? "" : undefined}
        initial={false}
        animate={{
          opacity: dragging ? 1 : 0,
          y: dragging ? 0 : 28,
          scale: !dragging ? 0.6 : reach === "over" ? 1.22 : reach === "near" ? 1.08 : 1,
        }}
        transition={SPRING}
        className="flex size-14 items-center justify-center rounded-full bg-black/45 text-white shadow-[0_8px_30px_rgba(0,0,0,0.3)] ring-1 ring-white/25 backdrop-blur-md"
      >
        <X className="size-6" strokeWidth={2} />
      </motion.span>
    </div>
  );
}
