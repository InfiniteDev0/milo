"use client";

/* Rows dragged into an order of your own inside a category's card, the way the
   task sheet's steps move: hold the grip and the row lifts, the others slide out
   of its way, and the order is kept when you let go. The saved order is a list
   of ids; anything not in it yet (new since the last drag) comes first. */

import { useEffect, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { Reorder, useDragControls, useMotionValue } from "motion/react";
import { useRaisedShadow } from "@/lib/raised-shadow";

const RESTING = "0px 0px 0px rgba(0, 0, 0, 0)";

// items in the saved order; the rest first, as they were
export function inOrder(items, order = []) {
  const at = new Map(order.map((id, i) => [id, i]));
  const loose = items.filter((x) => !at.has(x.id));
  const placed = items.filter((x) => at.has(x.id)).sort((a, b) => at.get(a.id) - at.get(b.id));
  return [...loose, ...placed];
}

// the whole order, with a reordered part (what a search left showing) put back in the places it held
export function mergeOrder(all, part) {
  const moved = new Set(part);
  let i = 0;
  return all.map((id) => (moved.has(id) ? part[i++] : id));
}

function Row({ id, onCommit, render }) {
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y, RESTING);
  const controls = useDragControls();
  // the grip: the only place a reorder starts, so a click still opens the row and a plain drag
  // (a note onto a category) still works
  const grip = (
    <button
      type="button"
      aria-label="Drag to reorder"
      title="Drag to reorder"
      onPointerDown={(e) => {
        // no native drag from here, only the reorder
        e.preventDefault();
        controls.start(e);
      }}
      onClick={(e) => e.stopPropagation()}
      className="-ms-1 shrink-0 cursor-grab touch-none text-foreground/20 transition-colors hover:text-foreground/50 active:cursor-grabbing"
    >
      <GripVertical className="size-4" />
    </button>
  );
  return (
    <Reorder.Item value={id} style={{ y, boxShadow }} dragListener={false} dragControls={controls} onDragEnd={onCommit} className="relative list-none rounded-lg">
      {render(grip)}
    </Reorder.Item>
  );
}

// items: in the card's order. renderRow(item, grip). onReorder(ids): the new order of these items;
// resolving false (it couldn't be kept) puts them back
export function ReorderList({ items, renderRow, onReorder }) {
  const key = items.map((x) => x.id).join(",");
  const [order, setOrder] = useState([]);
  const [orderKey, setOrderKey] = useState(null);
  // adjusted during render, so a change from outside never paints the old order first
  if (key !== orderKey) {
    setOrderKey(key);
    setOrder(key ? key.split(",") : []);
  }
  const latest = useRef(order);
  useEffect(() => {
    latest.current = order;
  }, [order]);

  const byId = new Map(items.map((x) => [x.id, x]));
  const commit = () => {
    const next = latest.current;
    if (next.join(",") === key) return;
    Promise.resolve(onReorder(next)).then((kept) => {
      if (kept === false) setOrder(key ? key.split(",") : []);
    });
  };

  return (
    <Reorder.Group
      axis="y"
      values={order}
      onReorder={setOrder}
      layoutScroll
      className="scrollbar-pill m-0 flex min-h-0 flex-1 list-none flex-col gap-1.5 overflow-y-auto p-0"
    >
      {order
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map((item) => (
          <Row key={item.id} id={item.id} onCommit={commit} render={(grip) => renderRow(item, grip)} />
        ))}
    </Reorder.Group>
  );
}
