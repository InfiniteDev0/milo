"use client";

// What's inside a block, shown the way the app shows it: the coloured header,
// the real Tick, and the same drag-to-reorder the block sheet uses — grip to
// move, tap anywhere to tick.

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { GripVertical, Volume2, VolumeX, X } from "lucide-react";
import { Reorder, useDragControls, useMotionValue } from "motion/react";
import Link from "next/link";
import { useRaisedShadow } from "@/lib/raised-shadow";
import { Tick } from "@/components/app/task-bits";

const RESTING = "0px 4px 0px rgba(219, 219, 219, 1)";

function Task({ task, onToggle }) {
  // y is non-zero exactly while the card is displaced, so no dragging flag is needed.
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y, RESTING);
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={task.name}
      style={{ y, boxShadow }}
      // the grip starts it, so selecting a title cannot begin a drag by accident
      dragListener={false}
      dragControls={controls}
      className="list-none rounded-xl border border-black/10 bg-white px-3 py-3"
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

        <Tick done={task.done} onToggle={onToggle} className="mt-0.5 size-5" />

        <span
          className={`min-w-0 flex-1 break-words text-sm ${
            task.done ? "text-black/40 line-through" : ""
          }`}
        >
          {task.name}
        </span>
      </div>
    </Reorder.Item>
  );
}

export function SheetBody({ block, tasks, sound, onToggleSound, onToggle, onReorder }) {
  const done = tasks.filter((t) => t.done).length;

  return (
    <>
      <div
        className="flex shrink-0 items-start gap-3 px-5 py-4"
        style={{ backgroundColor: block.bg, color: block.ink }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <DialogPrimitive.Title className="truncate text-lg font-medium">
            {block.name}
          </DialogPrimitive.Title>
          {/* Actuals only. Never "2 of 5" — what is left is not a number Milo shows. */}
          <span className="text-xs opacity-60">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            {done > 0 && <> · {done} done</>}
          </span>
        </div>

        {/* Off until asked for, and it lives where the sound actually happens. */}
        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={sound}
          aria-label={sound ? "Turn sound off" : "Turn sound on"}
          title={sound ? "Sound on" : "Sound off"}
          className="shrink-0 cursor-pointer rounded-lg p-1.5 opacity-50 transition-opacity hover:opacity-100"
        >
          {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </button>

        <DialogPrimitive.Close
          aria-label="Close"
          className="shrink-0 cursor-pointer rounded-lg p-1.5 opacity-50 transition-opacity hover:opacity-100"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </div>

      <Reorder.Group
        axis="y"
        values={tasks.map((t) => t.name)}
        onReorder={onReorder}
        className="m-0 flex min-h-0 flex-1 list-none flex-col gap-2.5 overflow-y-auto p-0 px-5 py-4"
      >
        {tasks.map((t) => (
          <Task key={t.name} task={t} onToggle={() => onToggle(t.name)} />
        ))}
      </Reorder.Group>

      <div className="shrink-0 border-t border-black/8 p-3 text-center">
        <Link href="/auth" className="text-xs text-black/45 underline hover:text-black">
          This is the real thing. Make it yours →
        </Link>
      </div>
    </>
  );
}
