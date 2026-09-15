// The interval log (TIME.md): one interval open at a time, and time only ever counted from what was observed.

import { stampToday } from "@/lib/stamp";

// the heartbeat: when we last knew someone was here
const SEEN_KEY = "milo:seen";
export const STALE = 2 * 60 * 1000;

export const closeSessions = (list, at = Date.now()) =>
  list.map((x) => (x.endedAt === null ? { ...x, endedAt: Math.max(at, x.startedAt) } : x));

// opening one closes whatever was open, so two clocks can never run
export const openSession = (list, blockId, taskId = null, at = Date.now()) => [
  ...closeSessions(list, at),
  { id: crypto.randomUUID(), day: stampToday(), blockId, taskId, startedAt: at, endedAt: null },
];

// `now ?? Date.now()`, not a default: useNow's first value is null, and a default only fills undefined
export const spentOn = (list, match, now) => {
  const at = now ?? Date.now();
  return list.filter(match).reduce((ms, x) => ms + ((x.endedAt ?? at) - x.startedAt), 0);
};

// the last millisecond of yesterday: an interval open across midnight belongs to the day it started in
export const lastNight = () => {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  return midnight.getTime() - 1;
};

// when the heartbeat last beat; 0 when it can't be read
export function lastSeen() {
  try {
    return Number(window.localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function beat() {
  try {
    window.localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {}
}

// a tab that died leaves an interval open: trim it back to the last moment anyone was seen, never invent time
export function recover(list) {
  const open = list.find((x) => x.endedAt === null);
  if (!open) return list;

  const seen = lastSeen();
  // still warm, and still the same day: pick the interval back up
  if (Date.now() - seen < STALE && open.day === stampToday()) return list;

  return closeSessions(list, Math.max(seen, open.startedAt));
}
