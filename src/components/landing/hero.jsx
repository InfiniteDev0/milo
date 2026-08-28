"use client";

import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dot } from "lucide-react";
import { Tooltip } from "../ui/tooltip-card";

export default function Hero() {
  const BLOCKS = [
    {
      title: "Morning block",
      tasks: "12 tasks",
      bg: "bg-black text-white",
      status: "Start",
    },
    {
      title: "Afternoon block",
      tasks: "8 tasks",
      bg: "bg-[#5e17eb] text-white",
      status: "Pending",
    },
  ];
  return (
    <section
      className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 bg-cover bg-center p-10 lg:h-[75vh] lg:gap-0 lg:py-0"
      // style={{ backgroundImage: "url('/hero.png')" }}
    >
      {/* Left content */}
      <div className="flex flex-col justify-center items-center text-center lg:items-start lg:text-left w-full h-full gap-7 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-6xl sm:text-5xl lg:text-6xl font-extralight">
            Manage Your <br /> Life in Blocks
          </h1>
          <div className="text-lg text-zinc-600">
            Milo is a daily organizing assistant, <br />
            that elevates your performance with the help of <br /> kanban
            blocks.
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
          Try Milo , it's Free
        </Button>
      </div>

      {/* Right content */}
      <div className="flex flex-col items-center justify-center h-full gap-1 relative">
        {BLOCKS.map(({ title, tasks, bg, status }, idx) => (
          <div
            key={title}
            className={`h-15 ${bg} flex items-center justify-between p-2 rounded-sm w-[62%]`}
          >
            <h1 className="text-xl ">{title}</h1>
            <div className="flex flex-col items-end">
              <p className="text-xs mr-1">{tasks}</p>
              <Button
                className={`${
                  status === "Start"
                    ? "bg-white text-black"
                    : "bg-gray-200 text-gray-700 cursor-not-allowed"
                }`}
              >
                {status}
              </Button>
            </div>
          </div>
        ))}
        {/* blocks */}
        <img src="/blocks.png" className="size-30 md:size-40 absolute left-0" alt="" />
        {/* Add tasks block */}
        <Link
          href="/login"
          className="h-10 w-[62%] border border-dotted hover:bg-white hover:border transition-all duration-500 border-gray-400 flex items-center justify-center rounded-sm cursor-pointer"
        >
          <span className="text-gray-600">Add a block</span>
        </Link>
        <h1 className="mt-2">
          Divide your tasks in blocks and handle seperately
        </h1>
      </div>
    </section>
  );
}
