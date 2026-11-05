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

// the Sunday a day's week starts on
const weekStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());

// a custom rule, { every, unit, days }, read against the origin the same way the fixed ones are
function customOn(custom, origin, day) {
  const every = Math.max(1, Number(custom?.every) || 1);
  switch (custom?.unit) {
    case "day":
      return daysBetween(origin, day) % every === 0;
    case "week": {
      const days = custom.days?.length ? custom.days : [origin.getDay()];
      return days.includes(day.getDay()) && (daysBetween(weekStart(origin), weekStart(day)) / 7) % every === 0;
    }
    case "month": {
      const months = (day.getFullYear() - origin.getFullYear()) * 12 + day.getMonth() - origin.getMonth();
      return day.getDate() === origin.getDate() && months % every === 0;
    }
    case "year":
      return day.getMonth() === origin.getMonth() && day.getDate() === origin.getDate() && (day.getFullYear() - origin.getFullYear()) % every === 0;
    default:
      return false;
  }
}

const UNITS = { day: ["day", "days"], week: ["week", "weeks"], month: ["month", "months"], year: ["year", "years"] };
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// "Every 2 weeks on Mon, Thu", "Every 3 days"
export function customLabel(custom) {
  if (!custom) return "Custom";
  const every = Math.max(1, Number(custom.every) || 1);
  const [one, many] = UNITS[custom.unit] ?? UNITS.day;
  const head = every === 1 ? `Every ${one}` : `Every ${every} ${many}`;
  return custom.unit === "week" && custom.days?.length ? `${head} on ${custom.days.map((d) => SHORT_DAYS[d]).join(", ")}` : head;
}

// does a task written on `origin` with this rule come round again on `day`? (never before its origin)
// custom: the rule itself, when rule is "custom"
export function repeatsOn(rule, origin, day, custom) {
  if (!rule || rule === "none" || day <= origin) return false;
  if (rule === "custom") return customOn(custom, origin, day);
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
