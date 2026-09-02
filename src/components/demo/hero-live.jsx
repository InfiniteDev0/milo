"use client";

// DEMO ONLY — a candidate replacement for the hero's right-hand column.
// The left column is copied verbatim from the shipped hero so the comparison is
// only about the part that changed. Nothing imports this except /demo/hero.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip-card";
import MiloFace from "@/components/MiloFace";

const TICK = 1100; // ms per task — fast enough to watch, slow enough to read

const BLOCKS = [
  {
    name: "Morning block",
    bg: "bg-black text-white",
    accent: "bg-white",
    tasks: ["Water + stretch", "Journal", "Clear the inbox", "Plan the day"],
  },
  {
    name: "Afternoon block",
    bg: "bg-[#5e17eb] text-white",
    accent: "bg-white",
    tasks: ["Draft the spec", "Ship the auth flow", "Review PRs"],
  },
];

export default function HeroLive() {
  const [done, setDone] = useState(() => BLOCKS.map(() => 0));
  const [active, setActive] = useState(null);
  const [note, setNote] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const cheerTimer = useRef(null);

  // one ticking block at a time — the whole point of the section
  useEffect(() => {
    if (active === null) return;
    const id = setInterval(() => {
      setDone((prev) => {
        const next = [...prev];
        const total = BLOCKS[active].tasks.length;
        if (next[active] >= total) return prev;
        next[active] += 1;
        if (next[active] === total) {
          const finished = next.reduce((a, b) => a + b, 0);
          setActive(null);
          setNote(`You showed up for ${finished} things today. Nice work.`);
          setCelebrating(true);
          clearTimeout(cheerTimer.current);
          cheerTimer.current = setTimeout(() => setCelebrating(false), 2200);
        }
        return next;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => () => clearTimeout(cheerTimer.current), []);

  const start = (i) => {
    if (active === i) {
      setActive(null);
      setNote(`${BLOCKS[i].name} paused. Nothing's lost.`);
      return;
    }
    if (active !== null) {
      // switching away pauses the old block instead of losing it
      setNote(`${BLOCKS[active].name} paused. Nothing's lost.`);
    } else {
      setNote(null);
    }
    setActive(i);
  };

  const reset = () => {
    setActive(null);
    setDone(BLOCKS.map(() => 0));
    setNote(null);
    setCelebrating(false);
  };

  const anyProgress = done.some((d) => d > 0);
  const mood = celebrating ? "cheer" : active !== null ? "focused" : undefined;

  return (
    <section className=" items-center gap-10 bg-cover bg-center w-full md:p-10 lg:min-h-[75vh] lg:gap-0 lg:py-0">
      {/* Left content — unchanged from the shipped hero */}
      <div className="flex flex-col justify-center items-center text-center  w-full h-full gap-7 p-6">
        <div className="flex flex-col  gap-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl md:font-extralight">
            Manage Your  Life in Blocks
          </h1>
          <div className="text-sm w-full md:text-lg space-y-1 text-zinc-600">
            <p>
              Milo is a daily organizing assistant, that elevates your
              performance with the help of kanban blocks.
            </p>
            <br />
            <span className="text-black">
              <Tooltip
                containerClassName="underline"
                content="No rigid streaks or daily shame. Life happens, so you choose what you want to handle each day. Doing even one task is a success, and your month naturally reflects your honest progress—with zero guilt."
              >
                <span className="font-bold">
                  Your <strong className="text-[#5e17eb]">Choice</strong>, Zero{" "}
                  <strong>Guilt</strong>
                </span>
              </Tooltip>
            </span>
          </div>
        </div>
        <Button className="flex items-center gap-2 bg-[#5e17eb] text-white text-md font-normal rounded-full px-5 py-2 h-12 w-fit transition-colors duration-300 hover:bg-black/90">
          Try Milo , it&apos;s Free
        </Button>
      </div>

      {/* Right content — the live day */}
      <div className="flex  items-center justify-end  relative p-6 lg:p-0">
        {/* Milo watches the blocks run */}
        <img src="/miloavatar.svg" className="size-40 absolute left-0 " alt="" />

        <div className="flex flex-col w-full items-center justify-center gap-2">
          {BLOCKS.map((block, i) => {
            const total = block.tasks.length;
            const finished = done[i];
            const isActive = active === i;
            const isDone = finished === total;
            const dimmed = active !== null && !isActive;

            return (
              <div
                key={block.name}
                className={`w-[90%] transition-opacity duration-500 md:w-[62%] ${
                  dimmed ? "opacity-40" : "opacity-100"
                }`}
              >
                <div
                  className={`relative flex h-15 items-center justify-between overflow-hidden rounded-sm p-2 ${block.bg}`}
                >
                  <div className="flex flex-col">
                    <h2 className="text-xl leading-tight">{block.name}</h2>
                    <span className="text-[11px] opacity-70">
                      {isDone
                        ? "Done"
                        : isActive
                          ? "Ongoing"
                          : finished > 0
                            ? "Paused"
                            : `${total} tasks`}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-0.5">
                    <p className="mr-1 text-xs">
                      {finished}/{total} tasks
                    </p>
                    <Button
                      onClick={() => start(i)}
                      disabled={isDone}
                      className={`flex h-7 items-center gap-1.5 rounded-sm px-3 text-xs ${
                        isDone
                          ? "bg-white/20 text-white"
                          : isActive
                            ? "bg-white/25 text-white"
                            : "bg-white text-black hover:bg-white/90"
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="size-3" /> Done
                        </>
                      ) : isActive ? (
                        <>
                          <Pause className="size-3" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="size-3" />
                          {finished > 0 ? "Resume" : "Start"}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* progress hairline */}
                  <span
                    className={`absolute bottom-0 left-0 h-[3px] ${block.accent} transition-[width] duration-700 ease-out`}
                    style={{ width: `${(finished / total) * 100}%` }}
                  />
                </div>

                {/* the tasks inside the block, ticking off one by one */}
                {(isActive || finished > 0) && (
                  <ul className="m-0 flex list-none flex-col gap-1 rounded-b-sm bg-white px-3 py-2 text-sm shadow-[0px_4px_16px_0px_rgba(0,0,0,0.04)]">
                    {block.tasks.map((task, t) => {
                      const complete = t < finished;
                      return (
                        <li
                          key={task}
                          className="flex items-center gap-2 transition-colors duration-300"
                        >
                          <span
                            className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                              complete
                                ? "border-[#5e17eb] bg-[#5e17eb] text-white"
                                : "border-black/20"
                            }`}
                          >
                            {complete && <Check className="size-2.5" />}
                          </span>
                          <span
                            className={
                              complete
                                ? "text-black/35 line-through"
                                : "text-black/70"
                            }
                          >
                            {task}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}

          {/* Add a block — unchanged */}
          <Link
            href="/login"
            className="flex h-10 w-[90%] cursor-pointer items-center justify-center rounded-sm border border-dotted border-gray-400 transition-all duration-500 hover:border hover:bg-white md:w-[62%]"
          >
            <span className="text-gray-600">Add a block</span>
          </Link>

          {/* the one line of feedback the whole thing is building toward */}
          <div className="flex h-10 items-center gap-3 text-center">
            {note ? (
              <>
                <p className="m-0 text-sm text-black/60">{note}</p>
                {anyProgress && (
                  <button
                    type="button"
                    onClick={reset}
                    className="flex cursor-pointer items-center gap-1 text-xs text-black/35 transition-colors hover:text-black/60"
                  >
                    <RotateCcw className="size-3" /> reset
                  </button>
                )}
              </>
            ) : (
              <p className="m-0 text-sm text-black/45">
                Start a block. Only one runs at a time.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
