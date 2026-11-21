// What the landing board shows. Block view: four blocks in their own colours, each with today's tasks.
// Task view: four days from today, each with its tasks (a time if it has one, ticked if done); Monday and Tuesday blank.

export const BLOCKS = [
  { name: "Morning", tone: "#f5c443", ink: "#2a2008", tasks: ["Read", "Walk", "Breakfast", "Plan the day"] },
  { name: "Create", tone: "#f4836f", ink: "#2e0f08", tasks: ["Design", "Logo", "Social post"], hidden: 1 },
  { name: "Deep Work", tone: "#2f5bff", ink: "#ffffff", tasks: ["Client project"] },
  { name: "Learning", tone: "#5fd0a0", ink: "#0a2a1c", tasks: ["Python", "AI course"] },
];

export const DAYS = [
  {
    day: "Saturday",
    date: "Nov 21",
    today: true,
    tasks: [{ title: "Read", done: true }, { title: "Walk", done: true }, { title: "Client project", time: "10:00" }, { title: "Python" }],
  },
  { day: "Sunday", date: "Nov 22", tasks: [{ title: "Breakfast with family", time: "9:30" }, { title: "Plan the week" }] },
  { day: "Monday", date: "Nov 23", tasks: [] },
  { day: "Tuesday", date: "Nov 24", tasks: [] },
];
