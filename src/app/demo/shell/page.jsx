"use client";

// Scratch route for choosing the app shell layout. Delete once decided.

import { useState } from "react";
import AppShell from "@/components/demo/app-shell";

const VARIANTS = [
  ["rail", "Blocks in the right rail"],
  ["strip", "Blocks as a strip on top"],
];

export default function ShellDemo() {
  const [variant, setVariant] = useState("rail");

  return (
    <div className="relative">
      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black p-1 shadow-lg">
        {VARIANTS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setVariant(id)}
            className={`cursor-pointer rounded-full px-4 py-2 text-xs transition-colors ${
              variant === id ? "bg-white text-black" : "text-white/50 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <AppShell variant={variant} />
    </div>
  );
}
