// A drop on the landing board, as the app's Task view does it: within a day it reorders; from a day that has gone it
// copies (the old day keeps it); from today or a day to come it moves. tasks is one flat list, in order.

let copies = 0;

export function dropTask(tasks, from, id, to, index) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return tasks;
  const source = tasks.filter((t) => t.day === from);
  const others = (day) => tasks.filter((t) => t.day !== day);

  if (from === to) {
    // the gap it leaves shifts everything after it up one
    const rest = source.filter((t) => t.id !== id);
    const at = index > source.indexOf(task) ? index - 1 : index;
    return [...others(to), ...rest.slice(0, at), task, ...rest.slice(at)];
  }

  const past = from < 0;
  const landed = past ? { ...task, id: `${task.id}-copy-${++copies}`, day: to } : { ...task, day: to };
  const target = tasks.filter((t) => t.day === to);
  target.splice(index, 0, landed);
  const kept = tasks.filter((t) => t.day !== to && (past || t.id !== id));
  return [...kept, ...target];
}
