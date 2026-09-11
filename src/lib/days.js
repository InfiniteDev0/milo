/* Which days a task appears on.
 *
 * EMPTY MEANS EVERY DAY. That default is what lets this feature not exist for
 * anyone who never reaches for it — a plain task behaves exactly as it did
 * before these columns were added.
 *
 * Names, not numbers. getDay() calls Sunday 0 and half the world calls Monday
 * the first day, and a silent off-by-one here would put someone's whole week on
 * the wrong days.
 */

export const DAYS = [
  { id: "mon", short: "M", name: "Monday" },
  { id: "tue", short: "T", name: "Tuesday" },
  { id: "wed", short: "W", name: "Wednesday" },
  { id: "thu", short: "T", name: "Thursday" },
  { id: "fri", short: "F", name: "Friday" },
  { id: "sat", short: "S", name: "Saturday" },
  { id: "sun", short: "S", name: "Sunday" },
];

const ORDER = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const todayId = (d = new Date()) => ORDER[d.getDay()];

/* A task with no days is a task for any day. A task with days appears only on
   them — and on the days it doesn't, it is ABSENT, not greyed out. A greyed-out
   row is still a row telling you what you are not doing. */
export const onDay = (task, day = todayId()) =>
  !task.days || task.days.length === 0 || task.days.includes(day);

// "Mon, Thu, Sat" — or nothing at all when it's every day
export function dayLabel(days) {
  if (!days || days.length === 0) return null;
  return DAYS.filter((d) => days.includes(d.id))
    .map((d) => d.name.slice(0, 3))
    .join(", ");
}
