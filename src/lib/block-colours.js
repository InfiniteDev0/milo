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

// Any colour from the picker: the preset's own ink when it is one of the list,
// otherwise dark ink on a light colour and white on a dark one, by luminance.
export function readableInk(bg) {
  const preset = BLOCK_COLOURS.find((c) => c.bg.toLowerCase() === bg?.toLowerCase());
  if (preset) return preset.ink;
  const m = /^#?([da-f]{2})([da-f]{2})([da-f]{2})/i.exec(bg ?? "");
  if (!m) return "#1a1400";
  const [r, g, b] = m.slice(1).map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#1a1400" : "#ffffff";
}
