// Which notes a search and a date range let through. Pure: `now` is passed in, never read here.

import { matchesSearch } from "./note-search";

export const RANGES = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

// the first moment of the range, in your own time zone
const startOf = (range, now) => {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  // weeks start on Monday
  if (range === "week") d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  if (range === "month") d.setDate(1);
  return d.getTime();
};

export function filterNotes(notes, { query = "", range = "all", now = null }) {
  const from = range === "all" || now == null ? null : startOf(range, now);

  return notes.filter((n) => {
    if (from != null && n.createdAt < from) return false;
    // the whole note, not just the lines a card shows
    return matchesSearch(n, query);
  });
}

// pinned first, then the newest
export const byPinnedThenNewest = (a, b) =>
  a.pinned === b.pinned ? b.createdAt - a.createdAt : b.pinned ? 1 : -1;
