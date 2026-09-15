// The small-surface contract: what a widget or a lock screen needs, in one plain object.
// Deliberately absent: any count of what isn't done, any streak or percentage, anything for a badge.

import { spentOn } from "./intervals";

// `now` is required: every caller already has a ticking clock
export function daySnapshot({ live, blocks, tasks, sessions }, now) {
  const running = live.find((b) => b.status === "ongoing") ?? null;
  const queue = live.filter((b) => b.status !== "done");
  const at = running ? queue.findIndex((b) => b.id === running.id) : -1;

  return {
    running: running
      ? {
          id: running.id,
          name: running.name,
          bg: running.bg,
          ink: running.ink,
          elapsedMs: spentOn(sessions, (x) => x.blockId === running.id, now),
        }
      : null,
    // your own order, read back — not a suggestion
    next: at >= 0 ? (queue[at + 1] ?? null) : (queue[0] ?? null),
    // the running block's tasks, in board order
    tasks: running
      ? tasks.filter((t) => t.blockId === running.id).map(({ id, name, status }) => ({ id, name, status }))
      : [],
    // counts up, always
    doneToday: blocks.filter((b) => b.status === "done").length,
    spentMs: spentOn(sessions, () => true, now),
  };
}
