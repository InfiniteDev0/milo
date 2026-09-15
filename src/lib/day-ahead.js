// What a day holds, worked out before it arrives: weekdays decide, the day's plan is laid on top.

import { onDay, todayId } from "./days";
import { dateOf, nextStamp } from "./stamp";

// "mon", "tue"… for a stamp
export const weekdayOf = (stamp) => todayId(dateOf(stamp));

// "Wednesday"
export const weekdayName = (stamp) =>
  dateOf(stamp).toLocaleDateString(undefined, { weekday: "long" });

// "Wednesday 16 September"
export const stampLabel = (stamp) =>
  dateOf(stamp).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

// a block's tasks on a day; tomorrow leaves out a once-task finished today, which the midnight roll archives
export function tasksOn(tasks, blockId, stamp, ahead) {
  const day = weekdayOf(stamp);
  return tasks.filter(
    (t) =>
      t.blockId === blockId &&
      onDay(t, day) &&
      !(ahead && t.kind === "once" && t.status === "done"),
  );
}

// notes for a day and a block, or the day itself when blockId is null
export function notesOn(notes, stamp, blockId, known) {
  const from = dateOf(stamp).getTime();
  const to = dateOf(nextStamp(stamp)).getTime();

  return notes.filter((n) => {
    // a note left for a day belongs to that day only; any other note to the day it was written
    const onIt = n.showOn ? n.showOn === stamp : n.createdAt >= from && n.createdAt < to;
    if (!onIt) return false;
    return blockId ? n.blockId === blockId : !n.blockId || !known.has(n.blockId);
  });
}
