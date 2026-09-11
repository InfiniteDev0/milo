"use client";

/* Blocks and tasks, against the database.
 *
 * The shape the app works in and the shape the database stores are not the
 * same, and the difference is the point:
 *
 *   BLOCKS and TASKS are what you shaped. Name, colour, order, which days,
 *   whether it comes back. They live in these tables and they persist.
 *
 *   STATUS is what happened today — ongoing, done, dropped. That belongs to
 *   the DAY, not to the block, and it lives in `days.block_state`. Keeping it
 *   here would mean a block carrying yesterday's result into this morning,
 *   which is the whole thing Milo refuses.
 *
 * So nothing in this file reads or writes a status. The mapping is here and
 * nowhere else — a component that knows about `block_id` is a component that
 * breaks when a column is renamed.
 */

import { createClient } from "@/lib/supabase/client";

const blockFromRow = (r) => ({
  id: r.id,
  name: r.name,
  bg: r.bg,
  ink: r.ink,
  archived: r.archived,
});

const taskFromRow = (r) => ({
  id: r.id,
  blockId: r.block_id,
  name: r.name,
  reason: r.reason ?? "",
  note: r.note ?? "",
  minutes: r.minutes,
  kind: r.kind ?? "routine",
  days: r.days ?? [],
  steps: (r.steps ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((s) => ({ id: s.id, name: s.name, done: s.done })),
});

/* One round trip for the whole shelf. Tasks bring their steps with them —
   a task with six steps should not be six more requests. */
export async function loadShape() {
  const db = createClient();

  const [blocks, tasks] = await Promise.all([
    db
      .from("blocks")
      .select("id, name, bg, ink, archived, position")
      .order("position"),
    /* Archived tasks are gone from the day, not from the record. A `once`
       task you finished is archived at the roll-over — done is done, it
       leaves the block — but its row stays, because days store task ids and
       deleting one would leave every past day holding an id nothing can
       resolve. */
    db
      .from("tasks")
      .select(
        "id, block_id, name, reason, note, minutes, kind, days, position, steps(id, name, done, position)",
      )
      .eq("archived", false)
      .order("position"),
  ]);

  if (blocks.error) throw blocks.error;
  if (tasks.error) throw tasks.error;

  return {
    blocks: blocks.data.map(blockFromRow),
    tasks: tasks.data.map(taskFromRow),
  };
}

/* ---------------------------------------------------------------- blocks -- */

// `at` is where this batch starts. A block added later goes last, not first.
export function createBlocks(userId, blocks, at = 0) {
  const db = createClient();
  return db.from("blocks").insert(
    blocks.map((b, i) => ({
      id: b.id,
      user_id: userId,
      name: b.name,
      bg: b.bg,
      ink: b.ink,
      position: at + i,
    })),
  );
}

export function saveBlock(block, position) {
  const db = createClient();
  return db
    .from("blocks")
    .update({
      name: block.name,
      bg: block.bg,
      ink: block.ink,
      archived: block.archived ?? false,
      ...(position === undefined ? {} : { position }),
    })
    .eq("id", block.id);
}

/* Order is a column, so reordering is a write per moved block. Sent as one
   batch because dragging one card can shift five positions. */
export function saveOrder(blocks) {
  const db = createClient();
  return Promise.all(
    blocks.map((b, i) =>
      db.from("blocks").update({ position: i }).eq("id", b.id),
    ),
  ).then(() => ({ error: null }));
}

export function deleteBlock(id) {
  const db = createClient();
  return db.from("blocks").delete().eq("id", id);
}

/* ----------------------------------------------------------------- tasks -- */

export function createTask(userId, task, position = 0) {
  const db = createClient();
  return db.from("tasks").insert({
    id: task.id,
    user_id: userId,
    block_id: task.blockId,
    name: task.name,
    reason: task.reason ?? "",
    note: task.note ?? "",
    minutes: task.minutes ?? null,
    kind: task.kind ?? "routine",
    days: task.days ?? [],
    position,
  });
}

export function createTasks(userId, tasks) {
  const db = createClient();
  return db.from("tasks").insert(
    tasks.map((t, i) => ({
      id: t.id,
      user_id: userId,
      block_id: t.blockId,
      name: t.name,
      reason: t.reason ?? "",
      note: t.note ?? "",
      minutes: t.minutes ?? null,
      kind: t.kind ?? "routine",
      days: t.days ?? [],
      position: i,
    })),
  );
}

export function saveTask(task) {
  const db = createClient();
  return db
    .from("tasks")
    .update({
      name: task.name,
      reason: task.reason ?? "",
      note: task.note ?? "",
      minutes: task.minutes ?? null,
      kind: task.kind ?? "routine",
      days: task.days ?? [],
    })
    .eq("id", task.id);
}

/* Out of the day, still in the record. See the migration for why this is
   not a delete. */
export function archiveTask(id) {
  const db = createClient();
  return db.from("tasks").update({ archived: true }).eq("id", id);
}

/* The order you dragged them into. Same shape as saveOrder for blocks: a
   write per moved row, sent as one batch because moving one card shifts
   every position under it.

   Positions are global across the tasks table, not per block, so this only
   ever renumbers the block it was handed — renumbering from 0 across the
   whole table would drag every other block's order around with it. */
export function saveTaskOrder(tasks) {
  const db = createClient();
  return Promise.all(
    tasks.map((t, i) =>
      db.from("tasks").update({ position: i }).eq("id", t.id),
    ),
  ).then(() => ({ error: null }));
}

export function deleteTask(id) {
  const db = createClient();
  return db.from("tasks").delete().eq("id", id);
}

/* ----------------------------------------------------------------- steps -- */

export function createStep(userId, taskId, step, position = 0) {
  const db = createClient();
  return db.from("steps").insert({
    id: step.id,
    user_id: userId,
    task_id: taskId,
    name: step.name,
    done: step.done ?? false,
    position,
  });
}

export function saveStep(step) {
  const db = createClient();
  return db.from("steps").update({ done: step.done, name: step.name }).eq("id", step.id);
}

// One write per step, sent as a batch. Only ever renumbers the task it was given.
export function saveStepOrder(steps) {
  const db = createClient();
  return Promise.all(
    steps.map((x, i) => db.from("steps").update({ position: i }).eq("id", x.id)),
  ).then(() => ({ error: null }));
}

export function deleteStep(id) {
  const db = createClient();
  return db.from("steps").delete().eq("id", id);
}
