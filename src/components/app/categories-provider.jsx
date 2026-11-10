"use client";

/* Your note categories and their subcategories (migration 0014), shared by
   everything that shows them. Optimistic like the rest of Milo: the screen
   changes at once and db/categories.js catches the database up, silently.

   A failed read writes nothing and never shows as "no categories" — the same
   rule the notes and blocks providers keep. Two levels only: the database
   refuses a third, so nothing here offers one. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { categoryQueue, listCategories } from "@/lib/db/categories";
import { playTask, playTuck } from "@/lib/sound";
import { useNotes } from "./notes-provider";
import { showUndoToast } from "./undo-toast";
import { markStep } from "./whats-new/steps";

const CategoriesContext = createContext(null);

const byPosition = (a, b) => a.position - b.position || a.createdAt - b.createdAt;

export function CategoriesProvider({ children }) {
  const { forgetCategories } = useNotes();
  const [list, setList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await createClient().auth.getUser();
        const rows = await listCategories();
        if (!alive) return;
        setUserId(user?.id ?? null);
        setList(rows);
      } catch (err) {
        // offline, or migration 0014 not applied yet — never conclude there are no categories
        if (alive) setLoadFailed(true);
        console.warn("[milo] could not load your categories", err);
      } finally {
        if (alive) setHydrated(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const canWrite = hydrated && !loadFailed && userId != null;
  const save = useCallback((c, wait = 0) => categoryQueue.save(c.id, [userId, c], wait), [userId]);

  // a change to one category; the database stamps it as the last edit, and so does the screen
  const patch = useCallback(
    (id, change, wait) => {
      if (!canWrite) return;
      const current = list.find((c) => c.id === id);
      if (!current) return;
      const next = { ...current, ...change, editedAt: Date.now() };
      setList((all) => all.map((c) => (c.id === id ? next : c)));
      save(next, wait);
    },
    [canWrite, list, save],
  );

  // after the last of its siblings
  const nextPosition = (parentId) =>
    Math.max(0, ...list.filter((c) => (c.parentId ?? null) === (parentId ?? null)).map((c) => c.position)) + 1;

  const addCategory = useCallback(
    ({ name = "", parentId = null, icon = null } = {}) => {
      if (!canWrite) return null;
      const now = Date.now();
      const c = { id: crypto.randomUUID(), parentId, name, icon, favorite: false, position: nextPosition(parentId), createdAt: now, editedAt: now };
      setList((all) => [...all, c]);
      save(c);
      // made with a name (from Move to or a label): that's the step; an unnamed one counts once it's named
      if (name.trim()) markStep("make-category");
      return c;
    },
    // nextPosition reads list
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canWrite, list, save],
  );

  // a copy right under the original; withSubs brings its subcategories too (never its notes)
  const duplicate = useCallback(
    (id, withSubs) => {
      if (!canWrite) return;
      const original = list.find((c) => c.id === id);
      if (!original) return;
      const siblings = list.filter((c) => (c.parentId ?? null) === (original.parentId ?? null)).sort(byPosition);
      const after = siblings[siblings.indexOf(original) + 1];
      const now = Date.now();
      const copy = {
        ...original,
        id: crypto.randomUUID(),
        name: `${original.name || "Untitled"} (copy)`,
        favorite: false,
        // halfway to the next one, so nothing else has to move
        position: after ? (original.position + after.position) / 2 : original.position + 1,
        createdAt: now,
        editedAt: now,
      };
      const subs = withSubs && !original.parentId
        ? list.filter((c) => c.parentId === id).map((s) => ({ ...s, id: crypto.randomUUID(), parentId: copy.id, favorite: false, createdAt: now, editedAt: now }))
        : [];
      setList((all) => [...all, copy, ...subs]);
      // the copy first: its subcategories need it to exist
      save(copy);
      subs.forEach((s) => setTimeout(() => save(s), 300));
    },
    [canWrite, list, save],
  );

  // parentId null makes it a category of its own; a category with subcategories can't go inside another
  const move = useCallback(
    (id, parentId) => {
      const c = list.find((x) => x.id === id);
      if (!c || (c.parentId ?? null) === (parentId ?? null) || id === parentId) return;
      if (parentId && list.some((x) => x.parentId === id)) return;
      patch(id, { parentId, position: nextPosition(parentId) });
      playTask();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [list, patch],
  );

  // gone from the screen now, from the database once Undo has had its few seconds.
  // Its subcategories go with it; the notes inside either stay, uncategorised
  const trash = useCallback(
    (id) => {
      if (!canWrite) return;
      const c = list.find((x) => x.id === id);
      if (!c) return;
      const going = new Set([id, ...list.filter((x) => x.parentId === id).map((x) => x.id)]);
      const removed = list.filter((x) => going.has(x.id));
      setList((all) => all.filter((x) => !going.has(x.id)));
      playTuck();
      showUndoToast({
        title: `Deleted “${c.name || "Untitled"}”`,
        hint: "Its notes stay where they are.",
        onCommit: () => {
          // the database deletes the subcategories along with it
          categoryQueue.remove(id);
          forgetCategories([...going]);
        },
        onUndo: () => {
          playTask();
          setList((all) => [...all.filter((x) => !going.has(x.id)), ...removed]);
        },
      });
    },
    [canWrite, list, forgetCategories],
  );

  // one place up or down among its siblings: the two swap positions
  const shift = useCallback(
    (id, by) => {
      if (!canWrite) return;
      const c = list.find((x) => x.id === id);
      if (!c) return;
      const siblings = list.filter((x) => (x.parentId ?? null) === (c.parentId ?? null)).sort(byPosition);
      const other = siblings[siblings.indexOf(c) + by];
      if (!other) return;
      const now = Date.now();
      const a = { ...c, position: other.position, editedAt: now };
      const b = { ...other, position: c.position === other.position ? c.position + by * -1 : c.position };
      setList((all) => all.map((x) => (x.id === a.id ? a : x.id === b.id ? b : x)));
      save(a);
      save(b);
    },
    [canWrite, list, save],
  );

  const value = useMemo(
    () => ({
      list: [...list].sort(byPosition),
      shift,
      hydrated,
      loadFailed,
      canWrite,
      addCategory,
      duplicate,
      move,
      trash,
      rename: (id, name) => {
        patch(id, { name }, 600);
        if (name.trim()) markStep("make-category");
      },
      setIcon: (id, icon) => {
        patch(id, { icon });
        if (icon) markStep("category-icon");
      },
      toggleFavorite: (id) => {
        const c = list.find((x) => x.id === id);
        if (c) patch(id, { favorite: !c.favorite });
      },
    }),
    [list, hydrated, loadFailed, canWrite, addCategory, duplicate, move, trash, patch, shift],
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used inside CategoriesProvider");
  return ctx;
}
