// What counts as a block's work today, and when a block is finished — the one definition the board and the provider share.

import { onDay } from "@/lib/days";

// a task sitting today out (today's plan) is not work today
export const NO_SKIPS = new Set();

export const workToday = (list, blockId, skipped = NO_SKIPS) =>
  list.filter((t) => t.blockId === blockId && onDay(t) && !skipped.has(t.id));

// finished means there WAS work today and all of it is done; a block with nothing today is not finished
export const blockFinished = (list, blockId, skipped) => {
  const mine = workToday(list, blockId, skipped);
  return mine.length > 0 && mine.every((t) => t.status === "done");
};

// part of today: something in it today, or already under way. An empty block stays out of the day
export const inDay = (block, tasks, skipped) =>
  block.status !== "todo" || workToday(tasks, block.id, skipped).length > 0;

// rest is for the gap between blocks; after the last one there is no gap to rest in, and an empty block isn't one
export const moreToCome = (list, justFinished, tasks, skipped) =>
  list.some(
    (b) =>
      b.id !== justFinished &&
      !b.dropped &&
      !b.archived &&
      b.status !== "done" &&
      inDay(b, tasks, skipped),
  );
