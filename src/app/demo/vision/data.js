// Made-up year for the vision board mockup: windows are groups of wishes, and wishes point at the blocks behind them.

export const BLOCKS = {
  morning: { name: "Morning", bg: "#F5C542", ink: "#1a1400" },
  deep: { name: "Deep Work", bg: "#3D5AFE", ink: "#ffffff" },
  learning: { name: "Learning", bg: "#5ECBA1", ink: "#04231a" },
  media: { name: "Media", bg: "#F5836A", ink: "#2b0d05" },
};

export const YEAR = {
  name: "The year I built Milo",
  icon: "🛠️",
  about: "Ship something real. Learn AI properly. Keep mornings mine.",
};

export const ULTIMATE = { text: "Ship Milo to real people", blocks: ["deep", "media"], days: 96 };

export const WILL = [
  { text: "Learn machine learning end to end", blocks: ["learning"], days: 71 },
  { text: "Make content every week", blocks: ["media"], days: 34 },
  { text: "Mornings that are mine", blocks: ["morning"], days: 142 },
];

export const PLACES = [
  { text: "Istanbul" },
  { text: "Zanzibar" },
  { text: "Kyoto" },
  { text: "Nairobi", achieved: "March" },
];

export const TRY = [{ text: "Pottery" }, { text: "A 10k run" }, { text: "Arabic calligraphy" }];

// wishes with no block yet: the ones still waiting for a home
export const DUMP = ["Start a newsletter?", "Build my own desk", "Cook biryani from scratch"];

export const ACHIEVED = [
  { text: "Launched the landing page", when: "12 August", days: 41 },
  { text: "Read 12 books", when: "2 September", days: 88 },
];
