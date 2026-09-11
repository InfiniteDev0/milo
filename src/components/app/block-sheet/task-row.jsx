"use client";

// One task in the block sheet. Reorderable, opens its own sheet.

import { GripVertical } from "lucide-react";
import { Reorder, useDragControls, useMotionValue } from "motion/react";
import { useRaisedShadow } from "@/lib/raised-shadow";
import { ACCENT } from "@/lib/palette";
import { shade } from "@/lib/shade";
import { Tick } from "../task-bits";

const RESTING = "0px 4px 0px rgba(219, 219, 219, 1)";
// The one whose sheet is open, so you can see which card you are editing.
const RESTING_OPEN = `0px 4px 0px ${shade(ACCENT, 0.15)}`;

export function TaskRow({ task, running, active, onToggle, onCommit, onOpen }) {
  // y is non-zero exactly while the card is displaced, so no dragging flag is needed.
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y, active ? RESTING_OPEN : RESTING);
  const controls = useDragControls();

  const steps = task.steps ?? [];
  const ticked = steps.filter((x) => x.done).length;
  const allSteps = steps.length > 0 && ticked === steps.length;

  return (
    <Reorder.Item
      value={task.id}
      style={{ y, boxShadow }}
      // the grip starts it, so selecting a title cannot begin a drag by accident
      dragListener={false}
      dragControls={controls}
      onDragEnd={onCommit}
      onClick={() => onOpen(task.id)}
      className={`list-none cursor-pointer rounded-xl border bg-white px-3 py-3 transition-colors ${
        active ? "border-[#5e17eb]/40" : "border-black/10"
      }`}
    >
      <div className="flex items-start gap-2">
        {/* touch-none or the browser takes the gesture for scrolling on a phone */}
        <button
          type="button"
          aria-label={`Reorder ${task.name}`}
          onPointerDown={(e) => controls.start(e)}
          className="-ml-1 mt-0.5 shrink-0 cursor-grab touch-none text-black/15 transition-colors hover:text-black/40 active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>

        {/* Only where it works: no open interval, nowhere for the time to go. */}
        {running && <Tick done={task.status === "done"} onToggle={onToggle} className="mt-0.5 size-5" />}

        <span
          className={`min-w-0 flex-1 break-words text-sm ${
            task.status === "done" ? "text-black/40 line-through" : ""
          }`}
        >
          {task.name}
        </span>

        {steps.length > 0 && (
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ${
              allSteps ? "bg-[#5e17eb] text-white" : "bg-[#5e17eb]/12 text-[#5e17eb]"
            }`}
          >
            {ticked}/{steps.length}
          </span>
        )}
      </div>

      {task.note && (
        <p
          className={`line-clamp-2 break-words text-xs leading-relaxed text-black/45 ${
            running ? "pl-12" : "pl-5"
          }`}
        >
          {task.note}
        </p>
      )}
    </Reorder.Item>
  );
}
