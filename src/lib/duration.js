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

// minutes → "0h 0m", as the Actual and Estimated columns read
export const hm = (minutes) => `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;

// ms → "0:00" (h:mm), as the card's pill reads
export function clock(ms) {
  const total = Math.floor(ms / 60000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export const PRESETS = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240];
export const presetLabel = (m) => (m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m / 60}h`);

// an estimate as the cards show it: "45m", "1h", "1h 30m"
export const minutesLabel = (m) => (m < 60 ? `${m}m` : m % 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m / 60}h`);
