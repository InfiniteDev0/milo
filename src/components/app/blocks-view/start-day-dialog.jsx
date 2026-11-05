"use client";

/* "Start your day", from Zeke: today's blocks in a list — drag to put them in
   the order you'll do them, untick any you're skipping today — then Start Day
   runs the first. Skipped blocks are set aside for today, as "not today" always
   did; nothing about them is counted or kept against you. */

import { useState } from "react";
import { Check, GripVertical } from "lucide-react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function Row({ block, selected, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-foreground/10 bg-card p-2",
        !selected && "opacity-50",
        isDragging && "relative z-10 shadow-lg",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${block.name}`}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        aria-label={selected ? `Skip ${block.name} today` : `Do ${block.name} today`}
        onClick={onToggle}
        className={cn(
          "flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border transition-colors",
          selected ? "border-foreground bg-foreground text-background" : "border-foreground/30",
        )}
      >
        {selected && <Check className="size-3" strokeWidth={3} />}
      </button>
      <span className="h-6 w-1 shrink-0 rounded-full" style={{ background: block.bg }} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{block.name.replace(" Block", "")}</span>
    </div>
  );
}

// the list is set from `blocks` each time it opens; key it on opening so it starts fresh
export function StartDayDialog({ open, onOpenChange, blocks, onStart }) {
  const [order, setOrder] = useState(() => blocks.map((b) => b.id));
  const [selected, setSelected] = useState(() => new Set(blocks.map((b) => b.id)));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const byId = new Map(blocks.map((b) => [b.id, b]));

  const toggle = (id) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start your day</DialogTitle>
          <DialogDescription>
            {selected.size} of {order.length} blocks today — drag to reorder, uncheck to skip.
          </DialogDescription>
        </DialogHeader>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (!over || active.id === over.id) return;
            setOrder((ids) => arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id)));
          }}
        >
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-1.5">
              {order.map((id) =>
                byId.has(id) ? <Row key={id} block={byId.get(id)} selected={selected.has(id)} onToggle={() => toggle(id)} /> : null,
              )}
            </div>
          </SortableContext>
        </DndContext>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 cursor-pointer rounded-lg bg-muted px-4 text-sm transition-colors hover:bg-muted/70"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selected.size === 0}
            onClick={() => {
              onStart(order, [...selected]);
              onOpenChange(false);
            }}
            className="h-9 cursor-pointer rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40"
          >
            Start Day
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
