import { DayBar } from "@/components/app/day-bar";
import { ViewOnly } from "@/components/app/view-only";
import { BlocksView } from "@/components/app/blocks-view";
import { TasksView } from "@/components/app/tasks-view";

export const metadata = {
  title: "Home — Milo",
};

/* The day.
 *
 * The greeting belongs to this page rather than the shell — it describes the
 * day being shown, and the shell is the same whatever day that is.
 *
 * Two views, switched by the top bar's tabs: Blocks, a column for each block
 * with today's tasks under it (blocks-view/), and Tasks, the days of the year
 * in a row (tasks-view/).
 */
export default function DailyPage() {

  return (
    <>
      {/* only dialogs, kept on both views so what opens them still works */}
      <DayBar />
      {/* the Blocks view */}
      <ViewOnly view="blocks">
        <BlocksView />
      </ViewOnly>

      {/* the Tasks view */}
      <ViewOnly view="tasks">
        <TasksView />
      </ViewOnly>
    </>
  );
}
