"use client";

// The wishes still in front of you. Each can be tied to its blocks, marked achieved, or set down — none is ever "not yet".

import { useState } from "react";
import { Plus } from "lucide-react";
import { IconInput } from "@/components/ui/icon-input";
import { playBlock, playTuck } from "@/lib/sound";
import { useBlocks } from "../blocks-provider";
import { sideCannons } from "../confetti";
import { showUndoToast } from "../undo-toast";
import { WishCard } from "./wish-card";

export const WISH_COLOURS = [
  { bg: "#F5C542", ink: "#1a1400" },
  { bg: "#F5836A", ink: "#2b0d05" },
  { bg: "#5ECBA1", ink: "#04231a" },
  { bg: "#A78BFA", ink: "#1c0f3d" },
  { bg: "#7FC6F5", ink: "#04202b" },
];

export function VisionBoard({ vision, rows, statsReady }) {
  const { blockById } = useBlocks();
  const { wishes, addWish, updateWish, achieveWish, removeWish, restoreWish } = vision;
  const [draft, setDraft] = useState("");
  const open = wishes.filter((w) => w.status === "open");

  const achieve = (wish) => {
    achieveWish(wish.id);
    playBlock();
    // the colours of the blocks that got it done, or the card's own
    const colours = wish.blocks.map((id) => blockById[id]?.bg).filter(Boolean);
    sideCannons(colours.length ? colours : [WISH_COLOURS[0].bg, WISH_COLOURS[2].bg, WISH_COLOURS[3].bg]);
  };

  const remove = (wish) => {
    const index = wishes.findIndex((w) => w.id === wish.id);
    removeWish(wish.id);
    playTuck();
    showUndoToast({
      title: "Wish deleted",
      hint: "You can still bring it back.",
      onCommit: () => {},
      onUndo: () => restoreWish(wish, index),
    });
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm text-foreground/45">Vision board</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {open.map((wish, i) => (
          <WishCard
            key={wish.id}
            wish={wish}
            colour={WISH_COLOURS[i % WISH_COLOURS.length]}
            rows={rows}
            statsReady={statsReady}
            onChange={(patch) => updateWish(wish.id, patch)}
            onAchieve={() => achieve(wish)}
            onSetDown={() => updateWish(wish.id, { status: "set-down" })}
            onDelete={() => remove(wish)}
          />
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addWish(draft);
            setDraft("");
          }}
          className="flex min-h-56 flex-col justify-center gap-3 rounded-3xl border-2 border-dashed border-foreground/15 p-6"
        >
          <span className="text-sm text-foreground/50">
            {open.length === 0 ? "What do you want from this year?" : "Something else you want this year"}
          </span>
          <IconInput
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add to the vision board…"
            aria-label="Add to the vision board"
            icon={<Plus className="size-4" />}
          />
        </form>
      </div>
    </section>
  );
}
