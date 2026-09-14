"use client";

// The block's name and colour, editable in place. Commitment 5: the user is the author.

import { useEffect, useRef, useState } from "react";
import { Check, Maximize2, Minimize2, Palette, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { BLOCK_COLOURS } from "@/lib/block-colours";
import { useBlocks } from "../blocks-provider";

export function Header({ block, tasks, done, time, full, onToggleFull }) {
  const { editBlock } = useBlocks();

  const [editing, setEditing] = useState(false);
  const [picking, setPicking] = useState(false);
  const [draft, setDraft] = useState("");
  const input = useRef(null);

  useEffect(() => {
    if (editing) input.current?.select();
  }, [editing]);

  // Blocks were born once in the wizard and could never be revised. A typo was forever.
  const commit = () => {
    const clean = draft.trim();
    if (clean && clean !== block.name) editBlock(block.id, { name: clean });
    setEditing(false);
  };

  return (
    <div
      className="relative flex shrink-0 items-start gap-3 px-5 py-4"
      style={{ backgroundColor: block.bg, color: block.ink }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {editing ? (
          <input
            ref={input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            aria-label="Block name"
            className="w-full rounded-lg bg-current/10 px-2 py-0.5 text-lg font-medium outline-none"
            style={{ color: block.ink }}
          />
        ) : (
          <DialogPrimitive.Title
            onClick={() => {
              setDraft(block.name);
              setEditing(true);
            }}
            className="-mx-2 cursor-text truncate rounded-lg px-2 py-0.5 text-lg font-medium transition-colors hover:bg-current/10"
          >
            {block.name.replace(" Block", "")}
          </DialogPrimitive.Title>
        )}

        {/* Actuals only. Never "2 of 5" — what is left is not a number Milo shows. */}
        <span className="text-xs opacity-60">
          {tasks} {tasks === 1 ? "task" : "tasks"}
          {done > 0 && <> · {done} done</>}
          {time && <> · {time} spent today</>}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setPicking((v) => !v)}
        aria-label="Change colour"
        className="shrink-0 cursor-pointer rounded-lg p-1.5 opacity-50 transition-opacity hover:opacity-100"
      >
        <Palette className="size-4" />
      </button>

      <button
        type="button"
        onClick={onToggleFull}
        aria-label={full ? "Shrink" : "Full screen"}
        className="shrink-0 cursor-pointer rounded-lg p-1.5 opacity-50 transition-opacity hover:opacity-100"
      >
        {full ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
      </button>

      <DialogPrimitive.Close
        aria-label="Close"
        className="shrink-0 cursor-pointer rounded-lg p-1.5 opacity-50 transition-opacity hover:opacity-100"
      >
        <X className="size-4" />
      </DialogPrimitive.Close>

      {picking && (
        <div className="absolute inset-x-3 top-full z-10 -mt-2 flex flex-wrap gap-2 rounded-xl bg-card p-3 shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-foreground/5">
          {BLOCK_COLOURS.map((c) => (
            <button
              key={c.bg}
              type="button"
              aria-label={`Use ${c.bg}`}
              onClick={() => {
                // ink travels with bg — contrast is chosen, never inferred
                editBlock(block.id, { bg: c.bg, ink: c.ink });
                setPicking(false);
              }}
              style={{ backgroundColor: c.bg }}
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg ring-1 ring-foreground/10 transition-transform hover:scale-110"
            >
              {c.bg === block.bg && (
                <Check className="size-4" strokeWidth={3} style={{ color: c.ink }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
