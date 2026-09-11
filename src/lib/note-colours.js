// What a note can be. Paper colours, not block colours — a note is not a block
// and borrowing that palette would make the two read as the same thing.

export const NOTE_COLOURS = [
  { id: "plain", bg: "#FFFFFF", ink: "#1a1a1a", label: "Plain" },
  { id: "butter", bg: "#FFF3C4", ink: "#3d3000", label: "Butter" },
  { id: "blush", bg: "#FFE0EC", ink: "#3d0018", label: "Blush" },
  { id: "sky", bg: "#DCEEFF", ink: "#00243d", label: "Sky" },
  { id: "mint", bg: "#DCF5E9", ink: "#00301f", label: "Mint" },
  { id: "lilac", bg: "#EBE3FF", ink: "#1d0b3d", label: "Lilac" },
];

export const noteColour = (id) =>
  NOTE_COLOURS.find((c) => c.id === id) ?? NOTE_COLOURS[0];
