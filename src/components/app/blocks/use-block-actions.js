"use client";

// Changing blocks: adding, renaming, archiving, setting one aside for today, reordering the line, and focus lock.

import { useCallback } from "react";
import { BLOCK_COLOURS } from "@/lib/block-colours";
import { createBlocks, deleteBlock, saveBlock } from "@/lib/db/blocks";
import { queueWrite, writeNow } from "@/lib/db/sync";
import { playLock } from "@/lib/sound";

export function useBlockActions({
  userId,
  blocks,
  setBlocks,
  setTasks,
  setFocusLocked,
  plans,
  todayStamp,
  writePlan,
}) {
  // a block is born on the month page, never on the day
  const addBlock = useCallback(
    (name) => {
      const clean = name.trim();
      if (!clean || !userId) return;

      // the first colour nobody is using, so a new block never arrives as a twin
      const taken = new Set(blocks.map((b) => b.bg));
      const colour =
        BLOCK_COLOURS.find((c) => !taken.has(c.bg)) ??
        BLOCK_COLOURS[blocks.length % BLOCK_COLOURS.length];

      const block = {
        id: crypto.randomUUID(),
        name: clean,
        bg: colour.bg,
        ink: colour.ink,
        status: "todo",
        archived: false,
      };

      setBlocks((prev) => [...prev, block]);
      writeNow(`block:${block.id}`, () => createBlocks(userId, [block], blocks.length));
    },
    [userId, blocks, setBlocks],
  );

  // renaming and recolouring change the shape, so they outlive the day; debounced, since renaming is typing
  const editBlock = useCallback(
    (id, patch) => {
      const next = blocks.map((b) => (b.id === id ? { ...b, ...patch } : b));
      setBlocks(next);
      const block = next.find((b) => b.id === id);
      if (block) queueWrite(`block:${id}`, () => saveBlock(block), { wait: 500 });
    },
    [blocks, setBlocks],
  );

  // gone for good, tasks with it; past days keep their ids and show a neutral chip
  const removeBlock = useCallback(
    (id) => {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      setTasks((prev) => prev.filter((t) => t.blockId !== id));
      writeNow(`block:${id}`, () => deleteBlock(id));
    },
    [setBlocks, setTasks],
  );

  // archived is shape, not today: a shelved block is shelved tomorrow too
  const archiveBlock = useCallback(
    (id) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, archived: true, status: b.status === "ongoing" ? "todo" : b.status }
            : b,
        ),
      );
      const block = blocks.find((x) => x.id === id);
      if (block) writeNow(`block:${id}`, () => saveBlock({ ...block, archived: true }));
    },
    [blocks, setBlocks],
  );

  const restoreBlock = useCallback(
    (id) => {
      setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, archived: false } : b)));
      const block = blocks.find((b) => b.id === id);
      if (block) writeNow(`block:${id}`, () => saveBlock({ ...block, archived: false }));
    },
    [blocks, setBlocks],
  );

  // set aside for today only; a finished block is a fact about the day, so it can't be
  const dropBlock = useCallback(
    (id) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === id && b.status !== "done"
            ? { ...b, dropped: true, status: b.status === "ongoing" ? "todo" : b.status }
            : b,
        ),
      );
    },
    [setBlocks],
  );

  const undropBlock = useCallback(
    (id) => {
      setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, dropped: false } : b)));
      // picked back up: a set-aside planned ahead must not put it down again on the next load
      const plan = plans[todayStamp];
      if (plan?.setAside.includes(id)) {
        writePlan(todayStamp, { ...plan, setAside: plan.setAside.filter((x) => x !== id) });
      }
    },
    [plans, todayStamp, writePlan, setBlocks],
  );

  // drop one block onto another to move it there; order is the only priority Milo has
  const reorderBlocks = useCallback(
    (fromId, toId) => {
      if (fromId === toId) return;
      setBlocks((prev) => {
        const from = prev.findIndex((b) => b.id === fromId);
        const to = prev.findIndex((b) => b.id === toId);
        if (from === -1 || to === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    },
    [setBlocks],
  );

  // a sound on the way in only; unlocking is not a failure
  const toggleFocusLock = useCallback(
    () =>
      setFocusLocked((v) => {
        if (!v) playLock();
        return !v;
      }),
    [setFocusLocked],
  );

  return {
    addBlock,
    editBlock,
    removeBlock,
    archiveBlock,
    restoreBlock,
    dropBlock,
    undropBlock,
    reorderBlocks,
    toggleFocusLock,
  };
}
