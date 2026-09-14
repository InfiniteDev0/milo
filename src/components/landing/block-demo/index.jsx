"use client";

/* The landing page's hands-on demo.
 *
 * Built from the app's LEAF components — Tick, TaskRings, Sheet, the same
 * Reorder rows — and its own useState. It never touches BlocksProvider: that
 * owns Supabase, the interval log and the write queue, and a marketing page has
 * no business near any of it. Importing the leaves is what stops this drifting.
 *
 * Sound is OFF until asked for. A page that makes noise the first time you
 * touch it contradicts the thing it is selling — and the toggle itself is
 * commitment 9: you decide how often Milo speaks, including never.
 */

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import MiloFace from "@/components/MiloFace";
import { Sheet } from "@/components/ui/sheet";
import { TaskRings } from "@/components/app/task-rings";
import { playBlock, playTask } from "@/lib/sound";
import { shade } from "@/lib/shade";
import { SheetBody } from "./sheet-body";

const BLOCKS = [
  {
    name: "Morning",
    bg: "#F5C542",
    ink: "#1a1400",
    tasks: ["Water and stretch", "Journal a page", "Clear the inbox"],
  },
  {
    name: "Deep Work",
    bg: "#2E5BFF",
    ink: "#ffffff",
    tasks: ["Draft the spec", "Ship the auth flow", "Review the PR"],
  },
  {
    name: "Wind Down",
    bg: "#A78BFA",
    ink: "#1c0f3d",
    tasks: ["Read a chapter", "Plan tomorrow"],
  },
];

const seed = () =>
  Object.fromEntries(
    BLOCKS.map((b) => [b.name, b.tasks.map((name) => ({ name, done: false }))]),
  );

export function BlockDemo() {
  const [state, setState] = useState(seed);
  const [openName, setOpenName] = useState(null);
  const [sound, setSound] = useState(false);

  const open = BLOCKS.find((b) => b.name === openName) ?? null;

  const toggle = (blockName, taskName) => {
    const after = state[blockName].map((t) =>
      t.name === taskName ? { ...t, done: !t.done } : t,
    );
    setState({ ...state, [blockName]: after });

    // Un-ticking claims nothing, so it says nothing. Same rule as the app.
    if (!after.find((t) => t.name === taskName).done) return;

    const finished = after.every((t) => t.done);
    if (sound) (finished ? playBlock : playTask)();
    if (!finished) return;

    toast.custom(
      () => (
        <div className="flex items-center gap-3 rounded-2xl bg-chrome py-2.5 pl-2.5 pr-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip">
            <MiloFace
              mood="cheer"
              instant
              gaze={false}
              blink={false}
              reactToScroll={false}
              className="size-10 touch-none select-none"
            />
          </span>
          <div className="flex flex-col">
            <span className="text-sm text-chrome-ink">
              That&rsquo;s {blockName} done.
            </span>
            {/* a number that only ever counts up */}
            <span className="text-xs text-chrome-ink/45">
              You showed up for {after.length}{" "}
              {after.length === 1 ? "thing" : "things"}.
            </span>
          </div>
        </div>
      ),
      {
        unstyled: true,
        // one id, so finishing a second block replaces the first toast
        // instead of stacking a pile of them up the corner
        id: "milo-demo",
        duration: 5000,
        position: "bottom-right",
      },
    );
  };

  // Reorder hands back the names in their new order; rebuild from those.
  const reorder = (blockName, names) => {
    const by = new Map(state[blockName].map((t) => [t.name, t]));
    setState({ ...state, [blockName]: names.map((n) => by.get(n)) });
  };

  return (
    // z-10: the cards read over the illustration behind them
    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3">
      {BLOCKS.map((b) => {
        const tasks = state[b.name];
        const done = tasks.filter((t) => t.done).length;

        return (
          <button
            key={b.name}
            type="button"
            onClick={() => setOpenName(b.name)}
            style={{ background: b.bg, color: b.ink, "--lift": shade(b.bg, 0.22) }}
            className="milo-lift flex h-16 w-[90%] cursor-pointer items-center justify-between gap-3 rounded-xl px-4 text-left md:w-[62%]"
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{b.name}</span>
              <span className="text-xs opacity-60">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                {done > 0 && <> · {done} done</>}
              </span>
            </div>
            <TaskRings
              todo={tasks.length - done}
              done={done}
              className="size-9 shrink-0"
            />
          </button>
        );
      })}

      <Link
        href="/auth"
        className="flex h-12 w-[90%] cursor-pointer items-center justify-center rounded-xl border border-dashed border-black/20 transition-colors duration-300 hover:border-black/40 hover:bg-white md:w-[62%]"
      >
        <span className="text-sm text-black/50">Add a block</span>
      </Link>

      {/* A caption, not a control. The sound toggle lives in the sheet, where
          the sound is. */}
      <p className="pt-1 text-center text-sm text-black/40">
        Open one. Tick something off.
      </p>

      <Sheet
        open={open !== null}
        onOpenChange={(o) => !o && setOpenName(null)}
        side="left"
        style={open ? { boxShadow: `0 24px 60px ${shade(open.bg, 0.5)}33` } : undefined}
      >
        {open && (
          <SheetBody
            block={open}
            tasks={state[open.name]}
            sound={sound}
            onToggleSound={() => setSound((v) => !v)}
            onToggle={(taskName) => toggle(open.name, taskName)}
            onReorder={(names) => reorder(open.name, names)}
          />
        )}
      </Sheet>
    </div>
  );
}
