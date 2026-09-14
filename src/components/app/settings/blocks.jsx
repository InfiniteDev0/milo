"use client";

// The only place in the app where a block can actually be lost.

import { Archive } from "lucide-react";
import { DeleteBlock } from "@/components/app/delete-block";
import { useBlocks } from "@/components/app/blocks-provider";

export function BlocksSection() {
  const { blocks, archiveBlock, loadFailed } = useBlocks();

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm">Your blocks</h2>
        <p className="text-xs text-foreground/40">
          Setting one aside keeps it and its tasks — it comes back from the
          archive in one click. Removing one does not.
        </p>
      </div>

      {/* A read that failed knows nothing about how many blocks there are, so
          it must never render as "you have none". */}
      {loadFailed ? (
        <p className="rounded-xl border border-foreground/10 px-4 py-6 text-center text-sm text-foreground/45">
          Couldn&rsquo;t reach your blocks. They&rsquo;re still there.
        </p>
      ) : blocks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-foreground/12 px-4 py-6 text-center text-sm text-foreground/35">
          No blocks yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {blocks.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-2 rounded-xl border border-foreground/10 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className="w-fit rounded-lg px-2.5 py-1 text-xs"
                  style={{ background: b.bg, color: b.ink }}
                >
                  {b.name.replace(" Block", "")}
                </span>

                {/* The safe option stands next to the dangerous one, or this
                    section teaches that deleting is how you remove a block. */}
                <button
                  type="button"
                  onClick={() => archiveBlock(b.id)}
                  disabled={loadFailed}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-foreground/10 px-2.5 py-1.5 text-xs text-foreground/50 transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-40"
                >
                  <Archive className="size-3.5" />
                  Set aside
                </button>
              </div>

              <DeleteBlock block={b} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
