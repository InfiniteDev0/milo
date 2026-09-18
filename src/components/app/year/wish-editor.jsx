"use client";

// Shaping a wish: its words, the blocks where the work for it happens, and a plan for when it gets hard.

import { Check } from "lucide-react";
import { useBlocks } from "../blocks-provider";

export function WishEditor({ wish, onChange, onDone }) {
  const { lineup, archived } = useBlocks();
  // a shelved block still shows if this wish already counts on it
  const choices = [...lineup, ...archived.filter((b) => wish.blocks.includes(b.id))];

  const toggle = (id) =>
    onChange({ blocks: wish.blocks.includes(id) ? wish.blocks.filter((x) => x !== id) : [...wish.blocks, id] });

  return (
    <div className="flex flex-col gap-3">
      <textarea
        autoFocus
        value={wish.text}
        onChange={(e) => onChange({ text: e.target.value })}
        aria-label="The wish"
        rows={2}
        className="w-full resize-none rounded-lg bg-white/60 px-3 py-2 text-lg leading-snug outline-none"
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs opacity-70">Where the work for it happens</span>
        <div className="flex flex-wrap gap-1.5">
          {choices.map((b) => {
            const on = wish.blocks.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => toggle(b.id)}
                aria-pressed={on}
                style={{ backgroundColor: b.bg, color: b.ink }}
                className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-opacity ${
                  on ? "ring-2 ring-black/60" : "opacity-60 hover:opacity-100"
                }`}
              >
                {on && <Check className="size-3" strokeWidth={3} />}
                {b.name.replace(" Block", "")}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs opacity-70">If it gets hard (optional)</span>
        <input
          value={wish.ifThen}
          onChange={(e) => onChange({ ifThen: e.target.value })}
          placeholder="If I skip a morning, I'll do ten minutes at lunch."
          className="rounded-lg bg-white/60 px-3 py-2 text-sm outline-none placeholder:text-black/35"
        />
      </label>

      <button
        type="button"
        onClick={onDone}
        className="w-fit cursor-pointer rounded-lg bg-black/80 px-4 py-1.5 text-sm text-white hover:bg-black"
      >
        Done
      </button>
    </div>
  );
}
