"use client";

// Your blocks, each with Set aside. Deleting one lives in its menu on the Month page, not here.

import { Archive } from "lucide-react";
import { useBlocks } from "@/components/app/blocks-provider";

export function BlocksSection() {
  const { blocks, archiveBlock, loadFailed } = useBlocks();

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm">Your blocks</h2>
        <p className="text-xs text-foreground/40">Setting one aside keeps it and its tasks — it comes back from the archive in one click.</p>
      </div>

      {/* A read that failed knows nothing about how many blocks there are, so
          it must never render as "you have none". */}
      {loadFailed ? (
        <p className="rounded-xl bg-foreground/4 px-4 py-6 text-center text-sm text-foreground/45">
          Couldn&rsquo;t reach your blocks. They&rsquo;re still there.
        </p>
      ) : blocks.length === 0 ? (
        <p className="rounded-xl bg-foreground/4 px-4 py-6 text-center text-sm text-foreground/35">No blocks yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {blocks.map((b) => (
            // one line each, filled, no edge
            <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl bg-foreground/4 px-3 py-2.5">
              <span className="w-fit rounded-lg px-2.5 py-1 text-xs" style={{ background: b.bg, color: b.ink }}>
                {b.name.replace(" Block", "")}
              </span>
              <button
                type="button"
                onClick={() => archiveBlock(b.id)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-foreground/6 px-2.5 py-1.5 text-xs text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <Archive className="size-3.5" />
                Set aside
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
