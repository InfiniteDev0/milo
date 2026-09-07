"use client";

/* The month: which blocks it's made of, and what goes in each one.
 *
 * This is the composing surface. Open a block, add its tasks one at a time.
 * The day view then just runs what the month defined — which is why there's no
 * add-task control on /daily.
 *
 * Counts here only ever go up. There is no target for a block to fall short
 * of, because nobody was asked to set one.
 */

import { useState } from "react";
import { Archive, Plus, X } from "lucide-react";
import { ScopeSwitcher } from "@/components/app/scope-switcher";
import { TaskRings } from "@/components/app/task-rings";
import { shade } from "@/lib/shade";
import { useBlocks } from "@/components/app/blocks-provider";
import { MonthHistory } from "@/components/app/month-history";
import { IconInput } from "@/components/ui/icon-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function MonthlyPage() {
  const { blocks, profile, countsFor, tasks, addTask, removeTask, archiveBlock, hydrated } =
    useBlocks();
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState("");

  const block = blocks.find((b) => b.id === openId) ?? null;
  const blockTasks = tasks.filter((t) => t.blockId === openId);

  const submit = (e) => {
    e.preventDefault();
    addTask(openId, draft);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col gap-5 px-8 pt-5 sm:px-12">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center bg-black p-1 px-2 rounded-md text-white gap-3">
          {profile?.month?.icon && (
            <span className="text-xl">{profile.month.icon}</span>
          )}
          <h1 className="truncate text-xl">
            {profile?.month?.name || "This month"}
          </h1>
        </div>
        <ScopeSwitcher />
      </div>

      {/* pr-3 keeps the scrollbar off the content — it lives inside this box,
          so without it the right-hand column sits under the thumb.

          pl-1 is for the rings. Setting overflow-y makes overflow-x compute
          to auto as well, so this box clips sideways too — and a ring paints
          OUTSIDE the element, which is why the leftmost cells looked like
          they had no left border. */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pl-1 pr-3 pb-6">

        {/* What already happened, above what is still being composed — the
            month reads as a record first and a plan second. */}
        <div className="pb-6">
          <MonthHistory />
        </div>

        <Separator/>

        <div className="mt-10 flex flex-col gap-3">
          {/* The counts are placeholder numbers until localStorage has been
              read. Showing them and then correcting them is worse than a
              blank line for a beat. */}
          {hydrated ? (
            <p className="text-sm text-black/45">
              {blocks.length} {blocks.length === 1 ? "block" : "blocks"} ·{" "}
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"} · open a
              block to add to it
            </p>
          ) : (
            <div className="h-5 w-56 animate-pulse rounded bg-black/[0.06]" />
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
            {/* Same footprint as a block card, so nothing shifts when the real
                ones arrive. Grey, never a block colour — a coloured placeholder
                would read as a block you have, and then change into a different
                one. */}
            {!hydrated &&
              Array.from({ length: 4 }, (_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-[92px] animate-pulse rounded-2xl bg-black/[0.04]"
                />
              ))}

            {hydrated &&
              blocks.map((b) => {
              const counts = countsFor(b.id);
              const total = counts.todo + counts.doing + counts.done;

              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setOpenId(b.id)}
                  className="milo-lift flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-2xl p-5 text-left"
                  style={{
                    background: b.bg,
                    color: b.ink,
                    "--lift": shade(b.bg, 0.22),
                  }}
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate font-medium">{b.name}</span>
                    <span className="text-xs opacity-60">
                      {total === 0
                        ? "Nothing in it yet"
                        : `${total} ${total === 1 ? "task" : "tasks"}`}
                    </span>
                  </div>
                  <TaskRings {...counts} className="size-10 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Month-end keep-or-swap goes here — the day-30 return reason. */}
        </div>
      </div>

      <Dialog open={block !== null} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="sm:max-w-md">
          {block && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2.5 text-left">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ background: block.bg }}
                  />
                  {block.name}
                </DialogTitle>
              </DialogHeader>

              <ul className="flex max-h-64 list-none flex-col gap-1.5 overflow-y-auto p-0">
                {blockTasks.length === 0 && (
                  <li className="rounded-lg border border-dashed border-black/12 px-3 py-6 text-center text-sm text-black/35">
                    Nothing in this block yet.
                  </li>
                )}
                {blockTasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-black/[0.04] px-3 py-2 text-sm"
                  >
                    <span
                      className={t.status === "done" ? "text-black/40 line-through" : ""}
                    >
                      {t.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTask(t.id)}
                      aria-label={`Remove ${t.name}`}
                      className="cursor-pointer text-black/25 transition-colors hover:text-black/60"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>

              <form onSubmit={submit} className="flex gap-2">
                <IconInput
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Add to ${block.name.replace(" Block", "")}…`}
                  icon={<Plus className="size-4" />}
                  aria-label="New task"
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={draft.trim() === ""}
                  className="h-[40px] shrink-0"
                >
                  Add
                </Button>
              </form>

              {/* Archiving is a composition decision, so it lives on the
                  month rather than the day. Reversible from the archive
                  panel — Ctrl + A. */}
              <button
                type="button"
                onClick={() => {
                  archiveBlock(block.id);
                  setOpenId(null);
                }}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-black/40 transition-colors hover:bg-black/[0.03] hover:text-black/70"
              >
                <Archive className="size-3.5" />
                Tuck into the archive
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
