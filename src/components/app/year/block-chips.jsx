"use client";

// Blocks as small coloured chips, optionally with a count beside each. A block deleted since is left out.

import { useBlocks } from "../blocks-provider";

export function BlockChips({ ids, counts }) {
  const { blockById } = useBlocks();
  const shown = ids.map((id) => blockById[id]).filter(Boolean);
  if (shown.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((b) => (
        <span
          key={b.id}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
          style={{ backgroundColor: b.bg, color: b.ink }}
        >
          {b.name.replace(" Block", "")}
          {counts?.[b.id] != null && <span className="opacity-70 tabular-nums">{counts[b.id]}</span>}
        </span>
      ))}
    </div>
  );
}
