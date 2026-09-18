"use client";

// Changing the vision board. Every change reads the board fresh from the profile, so two quick changes never undo each other.

import { useCallback } from "react";
import { newWish, readVision } from "@/lib/vision";
import { useBlocks } from "../blocks-provider";

export function useVision() {
  const { profile, setProfile } = useBlocks();
  const wishes = readVision(profile?.year?.vision);

  const change = useCallback(
    (edit) =>
      setProfile((p) => ({
        ...p,
        year: { ...(p?.year ?? {}), vision: edit(readVision(p?.year?.vision)) },
      })),
    [setProfile],
  );

  const addWish = useCallback(
    (text) => {
      const clean = text.trim();
      if (clean) change((list) => [...list, newWish(clean)]);
    },
    [change],
  );

  const updateWish = useCallback(
    (id, patch) => change((list) => list.map((w) => (w.id === id ? { ...w, ...patch } : w))),
    [change],
  );

  // stamped with the moment you marked it
  const achieveWish = useCallback(
    (id) =>
      change((list) => list.map((w) => (w.id === id ? { ...w, status: "achieved", achievedAt: Date.now() } : w))),
    [change],
  );

  const removeWish = useCallback((id) => change((list) => list.filter((w) => w.id !== id)), [change]);

  // put back where it was, for Undo
  const restoreWish = useCallback(
    (wish, index) =>
      change((list) => (list.some((w) => w.id === wish.id) ? list : [...list.slice(0, index), wish, ...list.slice(index)])),
    [change],
  );

  return { wishes, addWish, updateWish, achieveWish, removeWish, restoreWish };
}
