// The board's Block view: today's date with the arrows resting (it only ever shows today, as in the app), Start and
// Archived, then a column per block: its coloured head, Add a task, then today's tasks.

import { Archive, ChevronDown, CirclePlus, Play } from "lucide-react";
import { BLOCKS, TODAY } from "./board-data";
import { BoardHeader } from "./board-header";

const BOX = "flex items-center gap-1.5 rounded-md bg-(--b-fill) px-3 py-1.5 text-[13px]";

function Column({ name, tone, ink, tasks, hidden }) {
  return (
    <div className="flex w-[15rem] shrink-0 flex-col gap-2.5">
      <div className="flex items-center justify-between rounded-md px-4 py-3" style={{ background: tone, color: ink }}>
        <span className="flex flex-col text-left">
          <span className="text-[15px]">{name}</span>
          <span className="text-[11px] opacity-70">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
        </span>
        {/* start: a white tile with a ring in it */}
        <span className="flex size-8 items-center justify-center rounded-md bg-white/85">
          <span className="size-3.5 rounded-[4px] border-[3px] border-black" />
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-md bg-(--b-fill) px-3 py-2.5 text-[13px] text-(--b-ink2)">
        <CirclePlus className="size-4" />
        Add a task
      </div>
      {tasks.map((t) => (
        <div key={t} className="flex items-center gap-2.5 rounded-md border bg-(--b-card) px-3 py-3" style={{ borderColor: tone }}>
          <span className="size-4 shrink-0 rounded-full border border-(--b-line)" />
          <span className="flex-1 text-left text-[13px] text-(--b-ink)">{t}</span>
          <Play className="size-3.5 fill-current text-(--b-ink2)" />
          <span className="rounded-[4px] bg-(--b-fill2) px-1.5 py-0.5 text-[11px] text-(--b-ink2) tabular-nums">0:00</span>
        </div>
      ))}
      {hidden && (
        <div className="flex items-center gap-2 rounded-md bg-(--b-fill) px-3 py-2.5 text-[13px] text-(--b-ink2)">
          <span className="flex-1 text-left">Hidden tasks</span>
          <span className="rounded-[4px] bg-(--b-fill2) px-1.5 text-[11px]">{hidden}</span>
          <ChevronDown className="size-3.5" />
        </div>
      )}
    </div>
  );
}

export function BlockColumns() {
  return (
    <>
      <BoardHeader
        restingTitle="The Blocks view shows today"
        start={
          <span className={BOX}>
            <span className="text-[#3b82f6]">{TODAY.toLocaleDateString("en-US", { weekday: "long" })}</span> :{" "}
            {TODAY.toLocaleDateString("en-US")}
          </span>
        }
      >
        <span className={BOX}>
          <Play className="size-3.5 fill-current" /> Start
        </span>
        <span className={BOX}>
          <Archive className="size-3.5" /> Archived
          <span className="rounded-[4px] bg-(--b-fill2) px-1.5 text-[11px] text-(--b-ink2)">1</span>
        </span>
      </BoardHeader>
      <div className="flex h-[32rem] gap-6 px-4 pt-1">
        {BLOCKS.map((b) => (
          <Column key={b.name} {...b} />
        ))}
      </div>
    </>
  );
}
