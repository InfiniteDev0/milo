"use client";

// Scratch route for comparing hero variants side by side. Delete once a
// direction is picked — nothing links here.

import { useState } from "react";
import Hero from "@/components/landing/hero";
import HeroLive from "@/components/demo/hero-live";

const VARIANTS = [
  { id: "current", label: "Current", render: () => <Hero /> },
  { id: "live", label: "Live blocks", render: () => <HeroLive /> },
];

export default function HeroDemo() {
  const [variant, setVariant] = useState("live");

  return (
    <div className="px-3">
      {/* <div className="mx-auto mb-6 flex w-fit items-center gap-1 rounded-full bg-black p-1">
        {VARIANTS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setVariant(id)}
            className={`cursor-pointer rounded-full px-5 py-2 text-sm transition-all duration-300 ${
              variant === id ? "bg-white text-black" : "text-white/50 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div> */}

      {VARIANTS.find((v) => v.id === variant).render()}
    </div>
  );
}
