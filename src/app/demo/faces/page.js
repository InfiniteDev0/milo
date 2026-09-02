"use client";

// Drives the real <MiloFace /> with a forced mood, so every pose can be checked
// without scrolling and without wondering whether the page is cached.
// Scratch route — delete when you're done with it.

import { useState } from "react";
import MiloFace from "@/components/MiloFace";
import { POSES, VIEWBOX } from "@/lib/milo-poses";

const LADDER = [
  ["content", "0–22%"],
  ["focused", "22–46%"],
  ["proud", "46–68%"],
  ["happy", "68–90%"],
  ["cheer", "90–100%"],
];
const OTHER = [
  ["peek", "fast scroll"],
  ["sleepy", "12s idle"],
  ["idle", "retired"],
];

export default function FacesDemo() {
  const [mood, setMood] = useState("proud");
  const pose = POSES[mood];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-4xl font-extralight">Live face check</h1>
        <p className="m-0 text-zinc-600">
          This is the same <code>MiloFace</code> the navbar renders, with the
          mood forced. If a pose looks right here, the component is fine and
          anything you see on the landing page is scroll position or cache.
        </p>
      </div>

      {/* the face, big */}
      <div className="flex flex-col items-center gap-4 rounded-[32px] bg-white p-10">
        <MiloFace mood={mood} className="size-64 touch-none select-none" />
        <div className="flex items-center gap-4 text-sm">
          <span className="text-2xl font-medium">{mood}</span>
          <span className="flex items-center gap-1.5 text-black/50">
            <i
              className="size-3 rounded-sm ring-1 ring-black/10"
              style={{ background: pose.sf }}
            />
            {pose.sf}
          </span>
          <span className="text-black/50">
            mouth {pose.mf} · tongue {pose.ta}
          </span>
        </div>
      </div>

      {/* at navbar size, to check it still reads small */}
      <div className="flex items-center gap-6 rounded-[32px] bg-white p-6">
        <span className="text-sm text-black/40">At navbar size</span>
        <MiloFace mood={mood} className="size-14 touch-none select-none" />
        <span className="text-sm text-black/40">viewBox {VIEWBOX}</span>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-sm text-black/40">
          The scroll ladder — in the order you meet it going down the page
        </span>
        <div className="flex flex-wrap gap-3">
          {LADDER.map(([m, at], i) => (
            <Swatch key={m} m={m} at={`${String(i + 1).padStart(2, "0")} · ${at}`} mood={mood} setMood={setMood} />
          ))}
        </div>

        <span className="mt-4 text-sm text-black/40">Everything else</span>
        <div className="flex flex-wrap gap-3">
          {OTHER.map(([m, at]) => (
            <Swatch key={m} m={m} at={at} mood={mood} setMood={setMood} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Swatch({ m, at, mood, setMood }) {
  return (
    <button
      type="button"
      onClick={() => setMood(m)}
      className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 bg-white px-4 py-3 transition-colors duration-200 ${
        mood === m ? "border-black/20" : "border-transparent hover:border-black/8"
      }`}
    >
      <MiloFace mood={m} gaze={false} blink={false} reactToScroll={false} className="size-16" />
      <span className="text-sm font-medium">{m}</span>
      <span className="text-xs text-black/40">{at}</span>
    </button>
  );
}
