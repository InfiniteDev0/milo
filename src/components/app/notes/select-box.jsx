"use client";

// The tick that selects a note. It never opens the note it sits on.

import { Check } from "lucide-react";

export function SelectBox({ checked, onToggle, className = "" }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={!!checked}
      aria-label={checked ? "Unselect note" : "Select note"}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors ${
        checked
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/25 bg-card hover:border-foreground/50"
      } ${className}`}
    >
      {checked && <Check className="size-3.5" strokeWidth={3} />}
    </button>
  );
}
