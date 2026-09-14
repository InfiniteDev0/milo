"use client";

// Steps live only in here — never on the board. See RESEARCH.md for why.
// Same reorder list as the block sheet's tasks, one size down.

import { useEffect, useRef, useState } from "react";
import { GripVertical, ListChecks, Plus, X } from "lucide-react";
import { Reorder, useDragControls, useMotionValue } from "motion/react";
import { IconInput } from "@/components/ui/icon-input";
import { useRaisedShadow } from "@/lib/raised-shadow";
import { Tick } from "../task-bits";
import { useBlocks } from "../blocks-provider";

const RESTING = "0px 3px 0px var(--edge)";

function Step({ step, taskId, onCommit }) {
  const { toggleStep, removeStep } = useBlocks();
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y, RESTING);
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={step.id}
      style={{ y, boxShadow }}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onCommit}
      className="group/step flex list-none items-center gap-2 rounded-lg border border-foreground/10 bg-card px-2.5 py-2"
    >
      {/* touch-none or the browser takes the gesture for scrolling on a phone */}
      <button
        type="button"
        aria-label={`Reorder ${step.name}`}
        onPointerDown={(e) => controls.start(e)}
        className="shrink-0 cursor-grab touch-none text-foreground/15 transition-colors hover:text-foreground/40 active:cursor-grabbing"
      >
        <GripVertical className="size-3.5" />
      </button>

      <Tick
        done={step.done}
        onToggle={() => toggleStep(taskId, step.id)}
        className="size-4"
      />

      <span
        className={`min-w-0 flex-1 text-xs ${step.done ? "text-foreground/35 line-through" : ""}`}
      >
        {step.name}
      </span>

      <button
        type="button"
        onClick={() => removeStep(taskId, step.id)}
        aria-label={`Remove ${step.name}`}
        className="cursor-pointer text-foreground/0 transition-colors group-hover/step:text-foreground/30 hover:!text-foreground/70"
      >
        <X className="size-3.5" />
      </button>
    </Reorder.Item>
  );
}

export function Steps({ task }) {
  const { addStep, reorderSteps } = useBlocks();
  const [draft, setDraft] = useState("");

  const steps = task.steps ?? [];
  const [order, setOrder] = useState([]);
  const [orderKey, setOrderKey] = useState(null);
  const key = steps.map((x) => x.id).join(",");

  // Adjusted during render so a new task never paints the previous one's steps.
  if (key !== orderKey) {
    setOrderKey(key);
    setOrder(key ? key.split(",") : []);
  }

  const latest = useRef([]);
  useEffect(() => {
    latest.current = order;
  }, [order]);

  const byId = new Map(steps.map((x) => [x.id, x]));
  const shown = order.map((id) => byId.get(id)).filter(Boolean);

  return (
    <div className="flex flex-col gap-2 border-t border-foreground/5 pt-3">
      <div className="flex items-center gap-1.5 text-xs text-foreground/45">
        <ListChecks className="size-3.5" />
        Steps
      </div>

      <Reorder.Group
        axis="y"
        values={order}
        onReorder={setOrder}
        className="m-0 flex list-none flex-col gap-1.5 p-0"
      >
        {shown.map((step) => (
          <Step
            key={step.id}
            step={step}
            taskId={task.id}
            onCommit={() => reorderSteps(task.id, latest.current)}
          />
        ))}
      </Reorder.Group>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addStep(task.id, draft);
          setDraft("");
        }}
      >
        <IconInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Break it into a step…"
          aria-label="Add a step"
          icon={<Plus className="size-4" />}
        />
      </form>
    </div>
  );
}
