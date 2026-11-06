// Durations as people type them and as the task cards show them.

// "45m", "1h 30m", "1.5h", "90" (a bare number is minutes) → minutes; null if unreadable
export function parseDuration(text) {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (/^\d+(\.\d+)?$/.test(t)) return Math.round(Number(t));
  const h = t.match(/(\d+(?:\.\d+)?)\s*h/);
  const m = t.match(/(\d+)\s*m/);
  if (!h && !m) return null;
  return Math.round((h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0));
}

// minutes → "0h 0m", as the Actual and Estimated columns read. Rounded to the minute first, so 59.6
// minutes reads "1h 0m", never "0h 60m"
export const hm = (minutes) => {
  const total = Math.round(minutes);
  return `${Math.floor(total / 60)}h ${total % 60}m`;
};

// ms → the card's pill: "0:00" while nothing's been timed, then "<1m", "3m", "1h 5m" — rounded the
// same way as Actual, so the two never disagree (and "0:02" no longer reads as two seconds)
export function clock(ms) {
  if (!ms) return "0:00";
  const total = Math.round(ms / 60000);
  return total === 0 ? "<1m" : minutesLabel(total);
}

export const PRESETS = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240];
export const presetLabel = (m) => (m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m / 60}h`);

// an estimate as the cards show it: "45m", "1h", "1h 30m"
export const minutesLabel = (m) => (m < 60 ? `${m}m` : m % 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m / 60}h`);
