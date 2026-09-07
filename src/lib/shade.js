/* A darker version of a block's own colour, for the solid drop shadow under it.
 *
 * The lift has to be the SAME hue, only darker — a grey or black shadow under a
 * yellow block reads as dirt, which is exactly why the soft blurred shadow it
 * replaces looked wrong. Every block brings its own.
 */

export function shade(hex, amount = 0.24) {
  if (typeof hex !== "string") return "rgb(0 0 0 / 0.2)";

  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return "rgb(0 0 0 / 0.2)";

  const n = Number.parseInt(h, 16);
  if (Number.isNaN(n)) return "rgb(0 0 0 / 0.2)";

  const k = 1 - amount;
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);

  return `rgb(${r} ${g} ${b})`;
}
