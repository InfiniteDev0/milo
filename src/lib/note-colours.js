// What a note can be. Paper colours, not block colours — a note is not a block
// and borrowing that palette would make the two read as the same thing.
// Each paper has a deep version for dark mode, so the words on it stay readable.

import { shade } from "@/lib/shade";

export const NOTE_COLOURS = [
  { id: "plain", bg: "#FFFFFF", dark: "#201f1d", ink: "#1a1a1a", label: "Plain" },
  { id: "butter", bg: "#FFF3C4", dark: "#37301a", ink: "#3d3000", label: "Butter" },
  { id: "blush", bg: "#FFE0EC", dark: "#3a2029", ink: "#3d0018", label: "Blush" },
  { id: "sky", bg: "#DCEEFF", dark: "#1b2a3a", ink: "#00243d", label: "Sky" },
  { id: "mint", bg: "#DCF5E9", dark: "#18302a", ink: "#00301f", label: "Mint" },
  { id: "lilac", bg: "#EBE3FF", dark: "#29223d", ink: "#1d0b3d", label: "Lilac" },
];

export const noteColour = (id) =>
  NOTE_COLOURS.find((c) => c.id === id) ?? NOTE_COLOURS[0];

// both papers as CSS variables; `.milo-paper` in globals.css picks the one for the theme
export const paperStyle = (c) => ({
  "--paper": c.bg,
  "--paper-dark": c.dark,
  "--paper-lift": shade(c.bg),
  "--paper-lift-dark": shade(c.dark),
});
