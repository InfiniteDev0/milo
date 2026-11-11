"use client";

/* Start, Pause or Pick up — the day's one button, in the Blocks view's bar.

     nothing running   Start      opens "Start your day": order today's blocks,
                                  skip any, and the first one starts
     a block running   Pause      pauses the day; the block and task are remembered
     day paused        Pick up    straight back into what was running */

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBlocks } from "../blocks-provider";
import { BOX } from "../view-header";
import { StartDayDialog } from "./start-day-dialog";

export function DayButton() {
  const { blocks, dayBlocks, ongoing, paused, pauseDay, resumeDay, start, setBlockOrder, dropBlock } = useBlocks();
  const [open, setOpen] = useState(false);
  // a fresh list every time it opens
  const [opened, setOpened] = useState(0);

  // today's blocks still to do; with nothing in any of them yet, every block
  const choices = (dayBlocks.length ? dayBlocks : blocks).filter((b) => b.status !== "done");

  const state = paused ? "resume" : ongoing ? "pause" : "start";
  const Icon = state === "pause" ? Pause : Play;
  const label = state === "pause" ? "Pause" : state === "resume" ? "Pick up" : "Start";

  // the day menu's "Start your day" opens the same dialog
  useEffect(() => {
    const show = () => {
      setOpened((n) => n + 1);
      setOpen(true);
    };
    window.addEventListener("milo:start-day", show);
    return () => window.removeEventListener("milo:start-day", show);
  }, []);

  const press = () => {
    if (state === "pause") pauseDay();
    else if (state === "resume") resumeDay();
    else {
      setOpened((n) => n + 1);
      setOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={press}
        disabled={state === "start" && choices.length === 0}
        className={cn(
          BOX,
          "cursor-pointer gap-1.5 font-medium transition-colors disabled:cursor-default disabled:opacity-40",
          state === "pause" ? "border-transparent bg-(--theme-accent) text-white hover:bg-(--theme-accent)/90" : "hover:bg-muted",
        )}
      >
        <Icon className="size-3.5" fill="currentColor" />
        {label}
      </button>

      <StartDayDialog
        key={opened}
        open={open}
        onOpenChange={setOpen}
        blocks={choices}
        onStart={(order, selected) => {
          const keep = new Set(selected);
          // the order you chose becomes the blocks' order; the ones you unticked sit today out
          setBlockOrder(order);
          for (const id of order) if (!keep.has(id)) dropBlock(id);
          const first = order.find((id) => keep.has(id));
          if (first) start(first);
        }}
      />
    </>
  );
}
