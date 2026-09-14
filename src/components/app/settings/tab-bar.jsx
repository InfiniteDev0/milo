"use client";

// One row of sections. Settings was a single scroll of unrelated switches, so
// nothing was findable — the theme sat next to how a block gets deleted.

import { motion } from "motion/react";

export function TabBar({ tabs, value, onChange }) {
  return (
    <div className="flex shrink-0 items-center gap-7 border-b border-foreground/10">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          aria-current={value === t.id ? "page" : undefined}
          className={`relative cursor-pointer pb-3 text-md transition-colors ${
            value === t.id
              ? "text-foreground"
              : "text-foreground/40 hover:text-foreground/70"
          }`}
        >
          <h1>{t.label}</h1>

          {/* layoutId, so the underline travels to the tab you picked rather
              than blinking out of one and into the next */}
          {value === t.id && (
            <motion.span
              layoutId="settings-underline"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground"
            />
          )}
        </button>
      ))}
    </div>
  );
}
