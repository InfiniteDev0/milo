"use client";

// Scratch route for choosing the accent. Delete once it's decided.
// Each row renders the same four specimens so the comparison is like-for-like.

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

const CANDIDATES = [
  {
    id: "pair",
    hex: "#b459cf",
    action: "#84279e",
    name: "Recommended · brand + action",
    note: "L 62% brand for big shapes, L 47% sibling for buttons and text.",
  },
  {
    id: "current",
    hex: "#5e17eb",
    name: "Current",
    note: "C 0.269 — 1.7× more saturated than anything else in the brand.",
  },
  {
    id: "a",
    hex: "#5a3ec8",
    name: "A · same hue, calmer",
    note: "Identical hue, chroma pulled to 0.20. Smallest possible change.",
  },
  {
    id: "b",
    hex: "#762bb2",
    name: "B · warmer violet",
    note: "Rotated toward the warm side. Still unmistakably purple.",
  },
  {
    id: "c",
    hex: "#8f2697",
    name: "C · plum",
    note: "Sits in the same family as Milo's blush pink. Most on-brand.",
  },
  {
    id: "d",
    hex: "#492e7f",
    name: "D · ink violet",
    note: "Darkest and quietest. Premium, less playful.",
  },
];

function Specimens({ hex, action }) {
  const act = action ?? hex;
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* nav CTA */}
      <button
        style={{ background: act }}
        className="flex h-10 items-center gap-3 rounded-full pl-5 pr-1.5 text-sm text-white"
      >
        Get started
        <span className="flex size-7 items-center justify-center rounded-full bg-white">
          <ArrowRight className="size-4 text-black" />
        </span>
      </button>

      {/* block card */}
      <div
        style={{ background: hex }}
        className="flex h-15 w-64 items-center justify-between rounded-sm p-2 text-white"
      >
        <span className="text-xl">Afternoon block</span>
        <span className="text-xs opacity-80">8 tasks</span>
      </div>

      {/* status pill on white, as in the Life Blocks section */}
      <div className="flex h-15 items-center rounded-sm bg-white px-4">
        <span
          style={{ background: hex + "26", color: act }}
          className="rounded-full px-3 py-1 text-xs font-medium"
        >
          Ongoing
        </span>
      </div>

      {/* the bullet + link treatment */}
      <div className="flex h-15 items-center gap-2 rounded-sm bg-white px-4 text-sm">
        <span style={{ background: hex }} className="size-1.5 rounded-full" />
        <span style={{ color: act }}>Nothing goes overdue</span>
      </div>
    </div>
  );
}

export default function ColorDemo() {
  const [picked, setPicked] = useState("current");

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-10 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-4xl font-extralight">Accent candidates</h1>
        <p className="m-0 text-zinc-600">
          Same specimens in every row, on the real page background. Judge the
          block fill hardest — it&apos;s the largest area of accent on the site.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {CANDIDATES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setPicked(c.id)}
            className={`flex cursor-pointer flex-col gap-4 rounded-[24px] border-2 p-6 text-left transition-colors duration-300 ${
              picked === c.id ? "border-black/20 bg-white" : "border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                style={{ background: c.hex }}
                className="flex size-6 items-center justify-center rounded-full"
              >
                {picked === c.id && <Check className="size-3.5 text-white" />}
              </span>
              <span className="font-medium">{c.name}</span>
              <code className="text-sm text-black/40">{c.hex}</code>
              <span className="text-sm text-black/40">— {c.note}</span>
            </div>
            <Specimens hex={c.hex} action={c.action} />
          </button>
        ))}
      </div>

      {/* The quantity problem, shown rather than described */}
      <div className="flex flex-col gap-4">
        <h2 className="m-0 text-2xl font-extralight">
          The other half of the problem: how much of it there is
        </h2>
        <p className="m-0 max-w-2xl text-zinc-600">
          Right now the accent is the nav button, the hero button, a whole block
          card and half of a full-width band. An accent earns attention by being
          rare. Below: the same colour used sparingly.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-[24px] bg-white p-6">
            <span className="text-sm text-black/40">Now — accent everywhere</span>
            {["Morning block", "Afternoon block", "Evening block"].map((n, i) => (
              <div
                key={n}
                style={{ background: i === 0 ? "#000" : CANDIDATES.find((c) => c.id === picked).hex }}
                className="flex h-14 items-center rounded-sm p-3 text-white"
              >
                {n}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 rounded-[24px] bg-white p-6">
            <span className="text-sm text-black/40">
              Sparing — accent marks the one running block
            </span>
            {["Morning block", "Afternoon block", "Evening block"].map((n, i) => (
              <div
                key={n}
                className="flex h-14 items-center justify-between rounded-sm border border-black/8 bg-[#f4f2ee] p-3 text-black"
                style={
                  i === 1
                    ? {
                        background: "#fff",
                        boxShadow: `inset 3px 0 0 ${CANDIDATES.find((c) => c.id === picked).hex}`,
                      }
                    : undefined
                }
              >
                {n}
                {i === 1 && (
                  <span
                    style={{
                      background: `${CANDIDATES.find((c) => c.id === picked).hex}1a`,
                      color: CANDIDATES.find((c) => c.id === picked).hex,
                    }}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                  >
                    Ongoing
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
