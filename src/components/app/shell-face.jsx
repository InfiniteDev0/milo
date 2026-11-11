"use client";

/* The Milo in the shell. Autonomous most of the time — hover, poke, idle — but
   holds a pose for a few seconds after you finish something, so the face reacts
   to the work rather than only to the cursor. */

import MiloFace from "@/components/MiloFace";
import { useBlocks } from "./blocks-provider";

// mood: a face asked for here (a hovered choice in Milo's panel), over the one the work set
export function ShellFace({ className, mood }) {
  const { miloMood } = useBlocks();
  return <MiloFace mood={mood ?? miloMood} className={className} />;
}
