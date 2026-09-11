// Every colour a block can be. One list, so the wizard, the month review and
// the recolour picker cannot drift apart.

export const BLOCK_COLOURS = [
  { bg: "#F5C542", ink: "#1a1400" },
  { bg: "#2E5BFF", ink: "#ffffff" },
  { bg: "#5ECBA1", ink: "#04231a" },
  { bg: "#F5836A", ink: "#2b0d05" },
  { bg: "#7FC6F5", ink: "#04202b" },
  { bg: "#A78BFA", ink: "#1c0f3d" },
  { bg: "#F0A5C8", ink: "#2b0416" },
  { bg: "#9BD17E", ink: "#0f2405" },
  { bg: "#F5B36A", ink: "#2b1704" },
];

// Ink is picked with the colour, never guessed — contrast is not a thing to infer.
export const inkFor = (bg) =>
  BLOCK_COLOURS.find((c) => c.bg.toLowerCase() === bg?.toLowerCase())?.ink ?? "#1a1400";
