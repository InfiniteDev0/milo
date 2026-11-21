"use client";

// The tabs and the board under them, sharing one choice: Block view shows blocks, Task view shows days.

import { useState } from "react";
import { ViewSwitch } from "./view-switch";
import { BoardShot } from "./board-shot";

export function HeroStage() {
  const [view, setView] = useState("blocks");
  return (
    <>
      <div className="relative mx-auto mt-6 flex justify-center">
        <ViewSwitch value={view} onChange={setView} />
      </div>
      {/* wider than the words above it */}
      <div className="relative mx-auto mt-8 w-full max-w-[1440px] px-4 lg:px-8">
        <BoardShot view={view} />
      </div>
    </>
  );
}
