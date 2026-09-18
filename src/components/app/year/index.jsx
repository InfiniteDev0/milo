"use client";

// The year, in the order that keeps you going: what it's about, what you already achieved, the wishes still ahead
// (each tied to where the work happens), and the months you've lived so far. See RESEARCH.md, "The year page".

import { useBlocks } from "../blocks-provider";
import { AchievedShelf } from "./achieved-shelf";
import { SetDownShelf } from "./set-down-shelf";
import { useVision } from "./use-vision";
import { useYearDays } from "./use-year-days";
import { VisionBoard } from "./vision-board";
import { YearAbout } from "./year-about";
import { YearHeader } from "./year-header";
import { YearMonths } from "./year-months";

const THIS_YEAR = new Date().getFullYear();

function YearSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <span className="h-8 w-3/4 max-w-2xl rounded-lg bg-foreground/5" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-56 rounded-3xl bg-foreground/5" />
        ))}
      </div>
    </div>
  );
}

export function YearView() {
  const { hydrated, loadFailed, profile } = useBlocks();
  const vision = useVision();
  const days = useYearDays(THIS_YEAR);
  const statsReady = days.ready && !days.failed;

  return (
    <div className="flex h-full flex-col gap-5 px-6 pt-5 sm:px-10">
      <YearHeader />

      <div className="scrollbar-pill min-h-0 flex-1 overflow-y-auto overscroll-contain pb-10">
        {loadFailed ? (
          <p className="pt-10 text-sm text-foreground/45">Couldn’t reach your year. Nothing is lost.</p>
        ) : !hydrated ? (
          <YearSkeleton />
        ) : !profile ? (
          <p className="pt-10 text-sm text-foreground/45">Your year gets its name and vision during setup.</p>
        ) : (
          <div className="flex flex-col gap-10">
            <YearAbout />
            <AchievedShelf vision={vision} rows={days.rows} statsReady={statsReady} />
            <VisionBoard vision={vision} rows={days.rows} statsReady={statsReady} />
            <YearMonths year={THIS_YEAR} rows={days.rows} ready={days.ready} failed={days.failed} />
            <SetDownShelf vision={vision} />
          </div>
        )}
      </div>
    </div>
  );
}
