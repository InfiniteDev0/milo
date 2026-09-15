// What a finished day leaves behind: only what happened, and no entry at all for a day where nothing finished.

import { spentOn } from "./intervals";

// stamped as a string when the day is filed, never formatted at render, so the server and the browser agree
export const labelFor = (stamp) => {
  const [y, m, d] = stamp.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

// null when there is nothing to record; `endedAt` is set only when you closed the day yourself
export const summarise = (blocks, tasks, sessions, stamp, label, endedAt = null) => {
  const done = blocks
    .filter((b) => b.status === "done")
    .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0))
    .map(({ id, name, bg, ink }) => ({ id, name, bg, ink }));

  const finished = tasks.filter((t) => t.status === "done");
  if (done.length === 0 && finished.length === 0) return null;

  return {
    date: stamp,
    label,
    endedAt,
    blocks: done,
    tasks: finished.length,
    // time actually spent, never the sum of the estimates
    minutes: Math.round(spentOn(sessions, (x) => x.day === stamp) / 60000),
  };
};

// stored day rows into history entries; a block deleted since still happened, so it keeps a neutral place
export const historyFromRows = (rows, shapeById) =>
  rows
    .map((row) => {
      const done = Object.entries(row.block_state ?? {})
        .filter(([, v]) => v?.status === "done")
        .map(([id, v]) => {
          const b = shapeById.get(id);
          return {
            id,
            ...v,
            name: b?.name ?? "A block",
            bg: b?.bg ?? "#ECECEC",
            ink: b?.ink ?? "#2b2b2b",
          };
        });
      const things = Object.values(row.task_state ?? {}).filter((v) => v === "done").length;
      if (done.length === 0 && things === 0) return null;

      return {
        date: row.stamp,
        label: labelFor(row.stamp),
        blocks: done,
        tasks: things,
        minutes: 0,
        journal: row.journal ?? {},
        // null means midnight filed it and nobody has looked; that is the day the morning recap is for
        endedAt: row.ended_at ? Date.parse(row.ended_at) : null,
      };
    })
    .filter(Boolean);
