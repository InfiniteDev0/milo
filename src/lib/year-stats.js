// What a year of days adds up to — only what happened, always counted up. A month with nothing in it is absent.

const monthOf = (stamp) => Number(stamp.split("-")[1]);

// a block ran that day if it was started at all
const ranBlocks = (row) =>
  Object.entries(row.block_state ?? {})
    .filter(([, v]) => v?.status && v.status !== "todo")
    .map(([id]) => id);

const showedUp = (row) =>
  ranBlocks(row).length > 0 || Object.values(row.task_state ?? {}).some((s) => s === "done");

// today as it is on screen, so the page never waits on the last save
export function todayRow(stamp, blocks, tasks) {
  return {
    stamp,
    block_state: Object.fromEntries(
      blocks.filter((b) => b.status && b.status !== "todo").map((b) => [b.id, { status: b.status }]),
    ),
    task_state: Object.fromEntries(tasks.filter((t) => t.status === "done").map((t) => [t.id, "done"])),
  };
}

// the saved rows, with today's replaced by what's live
export const withToday = (rows, today) => [...rows.filter((r) => r.stamp !== today.stamp), today];

// one entry per month you showed up in, oldest first: days, and how many days each block ran
export function monthsOfYear(rows) {
  const months = new Map();
  for (const row of rows) {
    if (!showedUp(row)) continue;
    const m = monthOf(row.stamp);
    const entry = months.get(m) ?? { month: m, days: 0, ran: {} };
    entry.days += 1;
    for (const id of ranBlocks(row)) entry.ran[id] = (entry.ran[id] ?? 0) + 1;
    months.set(m, entry);
  }
  return [...months.values()].sort((a, b) => a.month - b.month);
}

// days any of these blocks ran — the days you showed up for a wish they serve
export function daysForBlocks(rows, blockIds) {
  if (!blockIds?.length) return 0;
  const wanted = new Set(blockIds);
  return rows.filter((row) => ranBlocks(row).some((id) => wanted.has(id))).length;
}
