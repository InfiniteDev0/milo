"use client";

// The Titan "app mockup with one real number" device, made interactive.
// It ends on the only number Milo ever shows you: what you did.

import { useEffect, useRef, useState } from "react";
import { Check, Pause, Play, RotateCcw } from "lucide-react";
import MiloFace from "@/components/MiloFace";

const TICK = 900;

const BLOCKS = [
  { name: "Morning", tasks: ["Water + stretch", "Journal", "Clear the inbox"] },
  { name: "Deep Work", tasks: ["Draft the spec", "Ship the auth flow"] },
  { name: "Wind Down", tasks: ["Read", "Plan tomorrow"] },
];

export default function DayDemo() {
  const [done, setDone] = useState(() => BLOCKS.map(() => 0));
  const [active, setActive] = useState(null);
  const [skipped, setSkipped] = useState([]);
  const [celebrating, setCelebrating] = useState(false);
  const cheer = useRef(null);

  useEffect(() => {
    if (active === null) return;
    const id = setInterval(() => {
      setDone((prev) => {
        const next = [...prev];
        const total = BLOCKS[active].tasks.length;
        if (next[active] >= total) return prev;
        next[active] += 1;
        if (next[active] === total) {
          setActive(null);
          setCelebrating(true);
          clearTimeout(cheer.current);
          cheer.current = setTimeout(() => setCelebrating(false), 1800);
        }
        return next;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => () => clearTimeout(cheer.current), []);

  const total = done.reduce((a, b) => a + b, 0);
  const mood = celebrating ? "cheer" : active !== null ? "focused" : undefined;

  const reset = () => {
    setActive(null);
    setDone(BLOCKS.map(() => 0));
    setSkipped([]);
    setCelebrating(false);
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-[28px] bg-white p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <span className="text-sm text-black/40">Today</span>
        {(total > 0 || skipped.length > 0) && (
          <button
            type="button"
            onClick={reset}
            className="flex cursor-pointer items-center gap-1 text-xs text-black/30 transition-colors hover:text-black/60"
          >
            <RotateCcw className="size-3" /> reset
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {BLOCKS.map((b, i) => {
          const finished = done[i];
          const isActive = active === i;
          const isDone = finished === b.tasks.length;
          const isSkipped = skipped.includes(i);

          return (
            <div
              key={b.name}
              className={`flex flex-col gap-2 rounded-2xl border p-3 transition-all duration-500 ${
                isActive
                  ? "border-[#5e17eb]/25 bg-[#5e17eb]/[0.04]"
                  : "border-black/8 bg-white"
              } ${active !== null && !isActive ? "opacity-45" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">{b.name}</span>
                  <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-black/50">
                    {isDone
                      ? "Done"
                      : isActive
                        ? "Ongoing"
                        : isSkipped
                          ? "Skipped"
                          : finished > 0
                            ? "Paused"
                            : `${b.tasks.length} tasks`}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {!isDone && !isSkipped && (
                    <button
                      type="button"
                      onClick={() => setSkipped((s) => [...s, i])}
                      className="cursor-pointer rounded-full px-2.5 py-1 text-xs text-black/35 transition-colors hover:bg-black/5 hover:text-black/60"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActive(isActive ? null : i)}
                    disabled={isDone}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
                      isDone
                        ? "cursor-default bg-emerald-50 text-emerald-700"
                        : "bg-black text-white hover:bg-black/85"
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
                  </button>
                </div>
              </div>

              {(isActive || finished > 0) && (
                <ul className="m-0 flex list-none flex-col gap-1 p-0 pl-0.5 text-sm">
                  {b.tasks.map((t, k) => {
                    const c = k < finished;
                    return (
                      <li key={t} className="flex items-center gap-2">
                        <span
                          className={`flex size-3.5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                            c
                              ? "border-[#5e17eb] bg-[#5e17eb] text-white"
                              : "border-black/15"
                          }`}
                        >
                          {c && <Check className="size-2" />}
                        </span>
                        <span className={c ? "text-black/30 line-through" : "text-black/60"}>
                          {t}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* the only number Milo ever puts in front of you */}
      <div className="flex items-center gap-4 rounded-2xl bg-[#f4f2ee] p-4">
        <MiloFace mood={mood} className="size-12 shrink-0 touch-none select-none" />
        <div className="flex min-w-0 flex-col">
          <span className="text-xl font-medium leading-tight">
            {total === 0
              ? "Nothing yet today."
              : `You showed up for ${total} thing${total === 1 ? "" : "s"} today.`}
          </span>
          <span className="text-sm text-black/45">
            {skipped.length > 0
              ? "Skipped blocks leave no mark. Try it — nothing changes here."
              : "No score. No percentage. No mention of what you didn’t do."}
          </span>
        </div>
      </div>
    </div>
  );
}
