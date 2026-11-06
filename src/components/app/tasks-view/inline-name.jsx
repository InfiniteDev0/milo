"use client";

// A name fixed in place, for tasks and subtasks: double-click it, or Rename on right-click.
// Enter or clicking away saves, Escape puts it back, and an emptied name keeps the old one.

import { useState } from "react";
import { cn } from "@/lib/utils";

// mounted only while editing, so it starts from the current name each time
function NameInput({ value, onSave, onStop, className }) {
  const [draft, setDraft] = useState(value);
  const done = (save) => {
    const clean = draft.trim();
    if (save && clean && clean !== value) onSave(clean);
    onStop();
  };
  // a press inside never reaches the card: no drag, no pinning, no keyboard drag on Enter or Space
  const keep = (e) => e.stopPropagation();
  return (
    <textarea
      autoFocus
      rows={1}
      value={draft}
      onFocus={(e) => e.target.select()}
      onChange={(e) => setDraft(e.target.value.replace(/\n/g, ""))}
      onKeyDown={(e) => {
        keep(e);
        if (e.key === "Enter") {
          e.preventDefault();
          done(true);
        }
        if (e.key === "Escape") done(false);
      }}
      onBlur={() => done(true)}
      onPointerDown={keep}
      onClick={keep}
      onDoubleClick={keep}
      aria-label="Name"
      className={cn(
        "field-sizing-content block w-full resize-none rounded-sm bg-background px-1 outline-none ring-1 ring-[#2f80ed] [overflow-wrap:anywhere]",
        className,
      )}
    />
  );
}

// editing: shown as a box; onEdit: a double-click asks to start
export function InlineName({ value, editing, onEdit, onSave, onStop, className, inputClassName, children }) {
  if (editing) return <NameInput value={value} onSave={onSave} onStop={onStop} className={inputClassName} />;
  return (
    <span
      className={className}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEdit?.();
      }}
    >
      {children}
    </span>
  );
}
