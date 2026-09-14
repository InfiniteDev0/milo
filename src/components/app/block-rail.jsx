"use client";

/* The blocks, as marks.
 *
 * Collapsed it's a stack of dashes — you can see how many blocks the day has
 * and which one is live, without the whole day being presented to you as a
 * list of demands. Hovering turns it into names.
 *
 * Blocks come from BlocksProvider, so clicking a mark here also drives the
 * ongoing-block card on the page.
 */

import { useBlocks } from "./blocks-provider";

// The same green the nav paints its active icon with, so "active" reads as
// one colour everywhere in the shell.
const ACTIVE = "#00d078";

export function BlockRail() {
  const { blocks, start } = useBlocks();

  return (
    <div className="group/rail absolute right-0 top-0 z-20">
      <div
        className="flex w-9 flex-col gap-2 rounded-[11px] bg-chrome py-2 pl-1.5 pr-2 transition-[width,padding] duration-300 ease-out group-hover/rail:w-44 group-hover/rail:px-2 group-hover/rail:py-2 motion-reduce:transition-none"
      >
        {blocks.map((b) => {
          const ongoing = b.status === "ongoing";
          const done = b.status === "done";

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => start(b.id)}
              title={b.name}
              className="relative flex h-3.5 cursor-pointer items-center justify-end rounded transition-colors duration-200 group-hover/rail:h-6 group-hover/rail:justify-start group-hover/rail:px-2 group-hover/rail:hover:bg-chrome-ink/10 motion-reduce:transition-none"
            >
              {/* collapsed: a mark */}
              <span
                aria-hidden
                className="h-[3px] rounded-full transition-all duration-300 group-hover/rail:opacity-0 motion-reduce:transition-none"
                style={{
                  width: ongoing ? 20 : 12,
                  background: ongoing
                    ? ACTIVE
                    : done
                      ? "var(--chrome-ink)"
                      : "#3a3a3a",
                }}
              />

              {/* expanded: the name */}
              <span
                className="absolute left-2 whitespace-nowrap text-xs opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 motion-reduce:transition-none"
                style={{
                  color: ongoing
                    ? ACTIVE
                    : done
                      ? "var(--chrome-ink)"
                      : "#6f6f6f",
                }}
              >
                {b.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
