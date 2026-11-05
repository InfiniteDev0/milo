// The days that get a badge in the Tasks view. Two kinds: fixed dates, and the
// Islamic days, which move each year and are read off the Hijri (Umm al-Qura)
// calendar the browser already has. Add one to a list to give it a badge.

// [month, day] — month 1–12
const FIXED = [
  [1, 1, "New Year's Day"],
  [12, 24, "Christmas Eve"],
  [12, 25, "Christmas Day"],
  [12, 31, "New Year's Eve"],
];

// [Hijri month, day] — month 1 is Muharram, 9 Ramadan, 10 Shawwal, 12 Dhu al-Hijjah
const HIJRI = [
  [1, 1, "Islamic New Year"],
  [1, 10, "Ashura"],
  [9, 1, "Ramadan begins"],
  [10, 1, "Eid al-Fitr"],
  [12, 9, "Day of Arafah"],
  [12, 10, "Eid al-Adha"],
];

let hijri = null;
function hijriOf(date) {
  try {
    hijri ??= new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { month: "numeric", day: "numeric" });
    const parts = Object.fromEntries(hijri.formatToParts(date).map((p) => [p.type, Number(p.value)]));
    return [parts.month, parts.day];
  } catch {
    // a browser without the Hijri calendar just shows no Islamic badges
    return [0, 0];
  }
}

export function specialDays(date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const [hm, hd] = hijriOf(date);
  return [
    ...FIXED.filter(([fm, fd]) => fm === m && fd === d),
    ...HIJRI.filter(([fm, fd]) => fm === hm && fd === hd),
  ].map(([, , name]) => name);
}
