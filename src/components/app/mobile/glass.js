// iPhone glass (from Manasik): see-through, blurred and colour-boosted from behind, no edge
// (the shadow carries it) and a light catch along the top; frosted white in light mode, smoked in dark.

import { cn } from "@/lib/utils";

export const GLASS = cn(
  "bg-white/55 backdrop-blur-2xl backdrop-saturate-200",
  "shadow-[0_10px_40px_-8px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.25)]",
  "dark:bg-neutral-900/45",
  "dark:shadow-[0_10px_40px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.04)]",
);
