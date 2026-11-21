// What the landing board shows. Block view: four blocks in their own colours, each with today's tasks.
// Task view: tasks on days counted from today (0 is Saturday 21 Nov 2026), a time if they have one, ticked if done.

export const BLOCKS = [
  { name: "Morning", tone: "#f5c443", ink: "#2a2008", tasks: ["Read", "Walk", "Breakfast", "Plan the day"] },
  { name: "Create", tone: "#f4836f", ink: "#2e0f08", tasks: ["Design", "Logo", "Social post"], hidden: 1 },
  { name: "Deep Work", tone: "#2f5bff", ink: "#ffffff", tasks: ["Client project"] },
  { name: "Learning", tone: "#5fd0a0", ink: "#0a2a1c", tasks: ["Python", "AI course"] },
];

export const TODAY = new Date(2026, 10, 21);

export const TASKS = [
  { id: "read", day: 0, title: "Read", done: true },
  { id: "walk", day: 0, title: "Walk", done: true },
  { id: "client", day: 0, title: "Client project", time: "10:00" },
  { id: "python", day: 0, title: "Python" },
  { id: "breakfast", day: 1, title: "Breakfast with family", time: "9:30" },
  { id: "week", day: 1, title: "Plan the week" },
];

// the date that many days from today
export const dayAt = (n) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + n);
