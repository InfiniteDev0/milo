// the colour of the app's strong buttons (the --solid token), kept on this device like light or dark

import { createPreference } from "./preference";

// black is the app as it ships: no colour laid over it
export const THEME_COLOURS = [
  { id: "black", label: "Black", hex: null },
  { id: "purple", label: "Purple", hex: "#7b68ee" },
  { id: "blue", label: "Blue", hex: "#1090e0" },
  { id: "pink", label: "Pink", hex: "#ee5e99" },
  { id: "violet", label: "Violet", hex: "#b660e0" },
  { id: "indigo", label: "Indigo", hex: "#6985ff" },
  { id: "orange", label: "Orange", hex: "#e16b16" },
  { id: "teal", label: "Teal", hex: "#0f9d9f" },
  { id: "bronze", label: "Bronze", hex: "#aa8d80" },
  { id: "mint", label: "Mint", hex: "#3db88b" },
];

export const COLOUR_KEY = "milo:theme-colour";
export const THEME_COLOUR = createPreference(
  COLOUR_KEY,
  THEME_COLOURS.map((c) => c.id),
  "black",
);

// run before the page paints, so a coloured theme never flashes black first
export const COLOUR_SCRIPT = `try{var c=localStorage.getItem("${COLOUR_KEY}");if(c&&c!=="black")document.documentElement.dataset.accent=c}catch(e){}`;
