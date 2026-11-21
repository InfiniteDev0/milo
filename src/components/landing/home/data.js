// What the drawings show: an ordinary few days, nothing late.

export const DAYS = [
  {
    day: "Monday",
    date: "17",
    tasks: [
      { title: "Book the dentist", label: "Health", done: true },
      { title: "Send the invoice", label: "Work", done: true },
      { title: "Pick up the parcel", label: "Errands" },
    ],
  },
  {
    day: "Tuesday",
    date: "18",
    today: true,
    tasks: [
      { title: "Draft the Q1 plan", label: "Work", time: "10:00" },
      { title: "30 minute walk", label: "Health", done: true },
      { title: "Water the plants", label: "Home" },
      { title: "Call Mum", label: "Home", time: "19:30" },
    ],
  },
  {
    day: "Wednesday",
    date: "19",
    tasks: [
      { title: "Team review", label: "Work", time: "14:00" },
      { title: "Groceries", label: "Errands" },
    ],
  },
];

const WORDS = "Ideas for the spring trip: leave on Friday, the coast road, the little bakery by the harbour, ask about the boat.";

export const NOTES = [
  { title: "Q1 plan", block: "Work", cover: "linear-gradient(135deg,#7b68ee,#5e17eb)", selected: true },
  { title: "Spring trip", block: "Home", text: WORDS },
  { title: "Book list", block: "Reading", cover: "linear-gradient(135deg,#ffd600,#00d078)" },
  { title: "Recipes to try", block: "Home", text: "Lemon pasta, the green curry from Sunday, overnight oats with pear, a proper sourdough." },
];
