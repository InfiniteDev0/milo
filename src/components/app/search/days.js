// A day named in what's typed: "today", "tomorrow", "yesterday", a weekday ("fri", "friday" — the
// next one, today included), or a date ("nov 12", "12 november"). Returns the day and the words left
// over, so "groceries friday" looks for groceries on Friday. This year only, as the Tasks view holds.
// The day is offered on top of the usual results, never instead of them: "sun" is a day and a word.

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const plus = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
// "fri", "frid", "friday" — three letters at least, so "mon" isn't "month"
const prefixOf = (word, list) => (word.length >= 3 ? list.findIndex((name) => name.startsWith(word)) : -1);

export function readDay(words) {
  const today = startOfToday();
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const rest = (n = 1) => [...words.slice(0, i), ...words.slice(i + n)];
    if (w === "today") return { day: today, words: rest() };
    if (w === "tomorrow") return { day: plus(today, 1), words: rest() };
    if (w === "yesterday") return { day: plus(today, -1), words: rest() };
    const wd = prefixOf(w, WEEKDAYS);
    if (wd >= 0) {
      return { day: plus(today, (wd - today.getDay() + 7) % 7), words: rest() };
    }
    // "nov 12" or "12 nov"
    const m = prefixOf(w, MONTHS);
    const next = words[i + 1];
    const prev = words[i - 1];
    if (m >= 0 && /^\d{1,2}$/.test(next ?? "")) {
      const d = new Date(today.getFullYear(), m, Number(next));
      if (d.getMonth() === m) return { day: d, words: rest(2) };
    }
    if (m >= 0 && /^\d{1,2}$/.test(prev ?? "")) {
      const d = new Date(today.getFullYear(), m, Number(prev));
      if (d.getMonth() === m) return { day: d, words: [...words.slice(0, i - 1), ...words.slice(i + 1)] };
    }
  }
  return null;
}

export const dayLabel = (d) => {
  const diff = Math.round((d - startOfToday()) / 86400000);
  const named = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : diff === -1 ? "Yesterday" : null;
  const date = d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
  return named ? `${named}, ${date}` : date;
};
