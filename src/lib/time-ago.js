// "2 minutes ago", "3 days ago" — how long since, in words. Past a month, the date itself.

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const STEPS = [
  ["second", 60],
  ["minute", 60],
  ["hour", 24],
  ["day", 30],
];

export function timeAgo(ms, now = Date.now()) {
  let diff = Math.round((ms - now) / 1000);
  for (const [unit, size] of STEPS) {
    if (Math.abs(diff) < size) return unit === "second" ? "just now" : rtf.format(diff, unit);
    diff = Math.round(diff / size);
  }
  return new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
