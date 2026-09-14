"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip-card";
import { BlockDemo } from "./block-demo";

export default function Hero() {
  return (
    <section
      className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 bg-cover bg-center w-full md:p-10 lg:h-[75vh] lg:gap-0 lg:py-0"
      // style={{ backgroundImage: "url('/hero.png')" }}
    >
      {/* Left content */}
      <div className="flex flex-col justify-center items-center text-center lg:items-start lg:text-left w-full h-full gap-7 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl md:font-extralight">
            Manage Your <br /> Life in Blocks
          </h1>
          <div className="text-sm w-full md:text-lg space-y-1 text-zinc-600">
            <p>
              Most planners break the moment your day does. Milo doesn&apos;t.
              Your day is a handful of blocks — start one, and when life
              interrupts, switch. The block you left just waits for you. Nothing
              goes overdue. Nothing is ever late.
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
        <Link href="/auth">
          <Button className="flex items-center gap-2 bg-[#5e17eb] text-white text-md font-normal rounded-full px-5 py-2 h-12 w-fit transition-colors duration-300 hover:bg-black/90">
            Try Milo, it&apos;s Free
          </Button>
        </Link>
      </div>

      {/* Right content — the demo owns the cards now, so the landing shows
          the app's own Tick, TaskRings and Sheet rather than a lookalike. */}
      <div className="relative flex h-full w-full items-center justify-center">
        <BlockDemo />
        {/* Hides itself if the file isn't there, so a missing asset is a
            missing picture rather than a broken-image icon. */}
        <img
          src="/Productive-Multi-Tasks--Streamline-Sketchvalley.svg"
          alt=""
          className="pointer-events-none absolute right-0 top-1/2 z-0 size-32 -translate-y-1/2 md:size-44"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    </section>
  );
}
