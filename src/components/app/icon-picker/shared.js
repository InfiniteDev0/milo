"use client";

// What the icon picker shares: the colours an icon can take, the skin tones, the
// remembered picks, and lucide's full set — loaded only when something needs it.

import { useEffect, useState } from "react";
import { createPreference } from "@/lib/preference";

export const ICON_COLOURS = [
  { id: "gray", hex: "#91918e" },
  { id: "slate", hex: "#6b7280" },
  { id: "brown", hex: "#a27763" },
  { id: "orange", hex: "#e07c39" },
  { id: "yellow", hex: "#dfab01" },
  { id: "green", hex: "#4d9b6f" },
  { id: "blue", hex: "#2f80ed" },
  { id: "purple", hex: "#9a6dd7" },
  { id: "pink", hex: "#e255a1" },
  { id: "red", hex: "#e5534b" },
];
export const ICON_COLOUR = createPreference(
  "milo:icon-colour",
  ICON_COLOURS.map((c) => c.id),
  "gray",
);

// 0 is the default yellow; 1–5 the skin tone modifiers, light to dark
export const TONE_MODS = ["1F3FB", "1F3FC", "1F3FD", "1F3FE", "1F3FF"];
export const TONE_HANDS = ["✋", "✋🏻", "✋🏼", "✋🏽", "✋🏾", "✋🏿"];
export const SKIN_TONE = createPreference("milo:skin-tone", ["0", "1", "2", "3", "4", "5"], "0");

// an emoji in the tone picked; people-groups take it only where every person has it
export function withTone(emoji, tone) {
  if (!tone || !emoji.skins) return emoji.unicode;
  const mod = TONE_MODS[tone - 1];
  const skin = emoji.skins.find((s) => {
    const mods = s.hexcode.split("-").filter((h) => TONE_MODS.includes(h));
    return mods.length > 0 && mods.every((m) => m === mod);
  });
  return skin?.unicode ?? emoji.unicode;
}

// the last emoji picked on this device, newest first — a convenience, so a failed read is just none
const RECENT_KEY = "milo:recent-emoji";
export function readRecent() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}
export function rememberEmoji(unicode) {
  try {
    const next = [unicode, ...readRecent().filter((u) => u !== unicode)].slice(0, 30);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

// lucide's whole set, fetched once: as the picker is reached for, or when an icon is first shown
let loaded = null;
let loading = null;
export const preloadIcons = () => (loading ??= import("lucide-react").then((m) => (loaded = m.icons)));
export function useLucideIcons() {
  const [icons, setIcons] = useState(loaded);
  useEffect(() => {
    if (!loaded) preloadIcons().then(setIcons);
  }, []);
  return icons ?? loaded;
}

// "ArrowsUpFromLine" → "arrows up from line"
export const iconWords = (name) => name.replace(/([a-z])([A-Z0-9])/g, "$1 $2").toLowerCase();
