"use client";

// A block, opened without starting it. The board only ever shows the RUNNING
// block, so this is the only way to see inside one before committing to it.
// Sheet, not page: the day stays on screen behind it. See RESEARCH.md.

import { useEffect, useRef, useState } from "react";
import { Reorder } from "motion/react";
import { Sheet } from "@/components/ui/sheet";
import { spent, useNow } from "@/lib/time";
import { shade } from "@/lib/shade";
import { useBlocks } from "../blocks-provider";
import { TaskSheet } from "../task-sheet";
import { Header } from "./header";
import { TaskRow } from "./task-row";
import { Footer } from "./footer";
import { AllTasks } from "./all-tasks";
import { Segmented } from "../settings/row";

const VIEWS = [
  { value: "today", label: "Today" },
  { value: "all", label: "All tasks" },
];

export function BlockSheet() {
  const { blocks, tasks, setTaskStatus, reorderTasks, spentOnBlock, isToday } = useBlocks();

  const [openId, setOpenId] = useState(null);
  const [full, setFull] = useState(false);
  const [openTask, setOpenTask] = useState(null);
  // today's tasks, or every task in the block
  const [view, setView] = useState("today");

  // The lineup is in the page and this is in the shell — siblings, no shared parent.
  useEffect(() => {
    const onOpen = (e) => {
      setOpenId(e.detail);
      setFull(false);
      setView("today");
      // or Reflect opens with Learning's task still sitting next to it
      setOpenTask(null);
    };
    window.addEventListener("milo:open-block", onOpen);
    return () => window.removeEventListener("milo:open-block", onOpen);
  }, []);

  const block = blocks.find((b) => b.id === openId) ?? null;
  const running = block?.status === "ongoing";

  // Ticks only while this block runs; a frozen clock reads as a broken one.
  const now = useNow(running);

  // Today's tasks only — a Friday task, or one sitting today out, is absent here, not greyed out.
  const mine = block ? tasks.filter((t) => t.blockId === block.id && isToday(t)) : [];

  // Summed from the interval log, so it can only ever be time that elapsed.
  const time = block ? spent(spentOnBlock(block.id, now ?? undefined)) : null;
  const done = mine.filter((t) => t.status === "done").length;

  // Ids, not task objects: the provider rebuilds those every render and Motion
  // identifies items by value.
  const [order, setOrder] = useState([]);
  const [orderKey, setOrderKey] = useState(null);
  const key = mine.map((t) => t.id).join(",");

  // Adjusted during render so a new block never paints the last one's list.
  if (key !== orderKey) {
    setOrderKey(key);
    setOrder(key ? key.split(",") : []);
  }

  // onReorder fires every frame; the write must not.
  const latest = useRef([]);
  useEffect(() => {
    latest.current = order;
  }, [order]);

  const byId = new Map(mine.map((t) => [t.id, t]));
  const shown = order.map((id) => byId.get(id)).filter(Boolean);

  // Rescheduling (in Today) or moving it to another block would otherwise leave it on screen.
  const shownTask =
    openTask && (view === "all" ? tasks.some((t) => t.id === openTask && t.blockId === block?.id) : byId.has(openTask))
      ? openTask
      : null;

  return (
    <Sheet
      open={block !== null}
      onOpenChange={(o) => !o && setOpenId(null)}
      wide={full}
      style={block ? { boxShadow: `0 24px 60px ${shade(block.bg, 0.5)}33` } : undefined}
    >
      {block && (
        <>
          <Header
            block={block}
            tasks={mine.length}
            done={done}
            time={time}
            full={full}
            onToggleFull={() => setFull((v) => !v)}
          />

          <div className="shrink-0 px-5 pt-3">
            <Segmented label="Which tasks" value={view} options={VIEWS} onChange={setView} />
          </div>

          <div className="scrollbar-pill min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">
            {view === "all" ? (
              <div className={full ? "mx-auto w-full max-w-2xl" : ""}>
                <AllTasks block={block} activeId={shownTask} onOpen={setOpenTask} />
              </div>
            ) : mine.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm text-foreground/35">Nothing in this block today.</p>
                <button
                  type="button"
                  onClick={() => setView("all")}
                  className="cursor-pointer rounded-lg px-3 py-1.5 text-xs text-foreground/55 ring-1 ring-foreground/10 transition-colors hover:text-foreground"
                >
                  See all its tasks
                </button>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={order}
                onReorder={setOrder}
                className={`m-0 flex list-none flex-col gap-2.5 p-0 ${
                  full ? "mx-auto w-full max-w-2xl" : ""
                }`}
              >
                {shown.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    running={running}
                    active={shownTask === t.id}
                    onOpen={setOpenTask}
                    onCommit={() => reorderTasks(block.id, latest.current)}
                    onToggle={() =>
                      setTaskStatus(t.id, t.status === "done" ? "todo" : "done")
                    }
                  />
                ))}
              </Reorder.Group>
            )}
          </div>

          <div className="shrink-0 border-t border-foreground/8 p-3">
            <Footer
              block={block}
              running={running}
              onClose={() => setOpenId(null)}
            />
          </div>
        </>
      )}

      <TaskSheet
        beside
        taskId={shownTask}
        // the X and Escape step back to the block you opened it from
        onClose={() => setOpenTask(null)}
        // clicking away from everything closes everything
        onDismiss={() => {
          setOpenTask(null);
          setOpenId(null);
        }}
      />
    </Sheet>
  );
}
