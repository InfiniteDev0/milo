import { DatePicker } from "@/components/app/date-picker";
import { BlockLineup } from "@/components/app/block-lineup";
import { TaskBoard } from "@/components/app/task-board";
import { DayBar } from "@/components/app/day-bar";
import { ScopeSwitcher } from "@/components/app/scope-switcher";
import { ArchiveButton } from "@/components/app/archive-panel";
import { DayLabel } from "@/components/app/day-label";
import { DayControl } from "@/components/app/day-control";
import { DayTheme } from "@/components/app/day-theme";
import { Tray } from "@/components/app/tray";

export const metadata = {
  title: "Today — Milo",
};

/* The day.
 *
 * The greeting and the date picker belong to this page rather than the shell —
 * they describe the day being shown, and the shell is the same whatever day
 * that is.
 *
 * Below them goes the day itself: blocks, the board, the timebox. Nothing yet,
 * because the data model isn't settled — see CLAUDE.md's open decisions.
 */
export default function DailyPage() {

  return (
    <div className="flex h-full flex-col gap-3 px-4 pt-4">
      {/* Pinned — never scrolls */}
      <div className="flex shrink-0 flex-col items-center gap-3">
        <div className="flex  items-center justify-between w-full">
          <div className="flex min-w-0 items-center gap-3">
            <DayLabel className="text-center" />
            {/* today's theme, if this weekday has one */}
            <DayTheme />
          </div>
          <div className="flex items-center gap-3">
            <ScopeSwitcher />
            {/* the shelf of blocks you keep but are not running today */}
            <ArchiveButton />
            {/* pausing is the one you reach for mid-interruption, so it sits out here as well as in the date menu */}
            <DayControl />
            {/* Pause and end live inside this now — they are the two things
                you can do to a day, and this button is the day. */}
            <DatePicker />
          </div>
        </div>
        {/* The lineup and the board share one box: when every block is done
            the lineup renders nothing, this row collapses, and the board below
            takes the whole space instead of leaving an empty band. */}
        <div className="flex w-full items-center justify-between empty:hidden">
          <BlockLineup />
        </div>
      </div>

      {/* only dialogs, so it lives outside the row that hides itself when empty */}
      <DayBar />

      {/* the board — columns are status, cards pooled from every block */}
      <div className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pb-4">
        <TaskBoard />
      </div>

      {/* today's notes. Belongs to the day, so it lives on the day page and not
          in the shell — the button was following you onto every other screen. */}
      <Tray />
    </div>
  );
}
