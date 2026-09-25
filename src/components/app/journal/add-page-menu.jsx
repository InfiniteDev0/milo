"use client";

// Start something new in the book: a page, an entry, a day plan, a month plan or the year's vision.
// A plan that already exists is opened instead of made twice.

import { useState } from "react";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBlocks } from "../blocks-provider";
import { monthStamp, todayStamp, yearStamp } from "./pages";

export function AddPageMenu({ book }) {
  const [open, setOpen] = useState(false);
  const { blocks } = useBlocks();
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const month = (d) => d.toLocaleDateString(undefined, { month: "long" });

  // turn to a plan that's already there, or make it
  const openOr = (kind, stamp, make) => {
    const there = (book.pages ?? []).find((p) => p.kind === kind && p.stamp === stamp);
    if (there) book.jump(Math.floor(book.slots.indexOf(there) / 2));
    else book.addPages(make());
  };

  const choices = [
    { label: "Plain page", run: () => book.addPages([{ heads: true }]) },
    { label: "Morning entry", run: () => book.addPages([{ heads: true, entry: "morning" }]) },
    { label: "Pause entry", run: () => book.addPages([{ heads: true, entry: "pause" }]) },
    { label: "Night entry", run: () => book.addPages([{ heads: true, entry: "night" }]) },
    null,
    {
      label: "Today’s plan",
      // today's blocks come pinned, for reference
      run: () =>
        openOr("day-schedule", todayStamp(), () => [
          { kind: "day-schedule", stamp: todayStamp(), blocks: blocks.map((b) => b.id) },
          { kind: "day-plan", stamp: todayStamp() },
        ]),
    },
    {
      label: `${month(now)} plan`,
      run: () => openOr("month", monthStamp(now), () => [{ kind: "month", stamp: monthStamp(now) }]),
    },
    {
      label: `${month(next)} plan`,
      run: () => openOr("month", monthStamp(next), () => [{ kind: "month", stamp: monthStamp(next) }]),
    },
    {
      label: `${now.getFullYear()} vision`,
      run: () => openOr("vision", yearStamp(now), () => [{ kind: "vision", stamp: yearStamp(now) }]),
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            disabled={!book.loaded}
            style={{ "--lift": "var(--solid-lift)" }}
            className="milo-lift flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-solid px-4 text-sm text-solid-ink hover:bg-solid-hover disabled:opacity-50"
          >
            <Plus className="size-4" />
            New page
          </button>
        }
      />
      <PopoverContent align="end" sideOffset={8} className="w-52 gap-0.5 p-1.5">
        {choices.map((c, i) =>
          c ? (
            <button
              key={c.label}
              type="button"
              onClick={() => {
                setOpen(false);
                c.run();
              }}
              className="cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-foreground/5"
            >
              {c.label}
            </button>
          ) : (
            <span key={`sep${i}`} className="my-1 h-px bg-foreground/10" />
          ),
        )}
      </PopoverContent>
    </Popover>
  );
}
