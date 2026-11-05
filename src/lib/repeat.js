// How a day task repeats, as Sunsama offers it. A rule is read against the day
// the task was written on (its origin): "every week" means every week on that
// weekday, "every month" means on that nth weekday of the month.

const WEEKDAY = { weekday: "short" };
const ORDINAL = ["1st", "2nd", "3rd", "4th", "5th"];

const DAY = 86400000;
const daysBetween = (a, b) => Math.round((b - a) / DAY);
// 1 for the first Tuesday of the month, 2 for the second…
const nthOfMonth = (d) => Math.ceil(d.getDate() / 7);

function ordinalDay(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function repeatOptions(origin) {
  const wd = origin.toLocaleDateString([], WEEKDAY);
  const md = `${origin.toLocaleDateString([], { month: "short" })} ${ordinalDay(origin.getDate())}`;
  return [
    { id: "none", label: "Does not repeat" },
    { id: "daily", label: "Every day" },
    { id: "weekdays", label: "Every weekday", hint: "Mon - Fri" },
    { id: "weekly", label: "Every week", hint: `on ${wd}` },
    { id: "biweekly", label: "Every 2 weeks", hint: `on ${wd}` },
    { id: "monthly", label: "Every month", hint: `on the ${ORDINAL[nthOfMonth(origin) - 1]} ${wd}` },
    { id: "yearly", label: "Every year", hint: `on ${md}` },
  ];
}

// does a task written on `origin` with this rule come round again on `day`? (never before its origin)
export function repeatsOn(rule, origin, day) {
  if (!rule || rule === "none" || day <= origin) return false;
  const dow = day.getDay();
  switch (rule) {
    case "daily":
      return true;
    case "weekdays":
      return dow !== 0 && dow !== 6;
    case "weekly":
      return dow === origin.getDay();
    case "biweekly":
      return dow === origin.getDay() && (daysBetween(origin, day) / 7) % 2 === 0;
    case "monthly":
      return dow === origin.getDay() && nthOfMonth(day) === nthOfMonth(origin);
    case "yearly":
      return day.getMonth() === origin.getMonth() && day.getDate() === origin.getDate();
    default:
      return false;
  }
}
