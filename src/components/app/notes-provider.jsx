"use client";

// Every note, shared by the notes sheet and the Notes page. Everything autosaves.
// A failed read writes nothing and never shows as "no notes" — the same rule the blocks provider keeps.
//
// Deleting moves a note to Trash (notes.deleted_at, migration 0015): `notes` is every note NOT in
// Trash, `trashed` the ones that are, and only Trash deletes for good. Before 0015 a delete is still
// Undo-first and then for good, as it always was. `opened` is when each note was opened today
// (note_opens), for the Recent tab.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listCovers, listNotes, notesSupport, toPlain } from "@/lib/db/notes";
import { listOpenedToday, saveOpen } from "@/lib/db/note-opens";
import { deleteNoteForGood, saveNoteSoon } from "@/lib/db/note-queue";
import { playTask, playTuck } from "@/lib/sound";
import { showMovedToast } from "./moved-toast";
import { showUndoToast } from "./undo-toast";
import { useFollowTasks } from "./notes/use-follow-tasks";
import { markStep } from "./whats-new/steps";

const NotesContext = createContext(null);

const newestFirst = (a, b) => b.createdAt - a.createdAt;

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  // note id -> opened at, since midnight; null if they couldn't be read
  const [opened, setOpened] = useState({});
  const [trashReady, setTrashReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await createClient().auth.getUser();
        const list = await listNotes();
        if (!alive) return;
        setUserId(user?.id ?? null);
        setNotes(list);
        setTrashReady(notesSupport().trash);
        // covers come after the list (same migration as Trash). Until a note's cover is known it stays
        // undefined, so a save in the meantime leaves the cover column alone rather than clearing it
        if (notesSupport().trash) {
          listCovers()
            .then((covers) => alive && setNotes((prev) => prev.map((n) => ({ ...n, cover: covers[n.id] ?? null }))))
            .catch((err) => console.warn("[milo] could not load note covers", err));
        }
        // Recent only: if these can't be read the notes still open; Recent says so instead
        listOpenedToday()
          .then((o) => alive && setOpened(o))
          .catch(() => alive && setOpened(null));
      } catch (err) {
        // offline, or migration 0008 not applied yet — never conclude there are no notes
        if (alive) setLoadFailed(true);
        console.warn("[milo] could not load your notes", err);
      } finally {
        if (alive) setHydrated(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // nothing is written until the real notes have loaded
  const canWrite = hydrated && !loadFailed && userId != null;

  // a moved task takes its notes with it
  useFollowTasks({ notes, setNotes, canWrite, userId });

  // `fields` can carry a blockId, so + on a block's card makes a note already in that block
  const addNote = useCallback(
    (fields = {}) => {
      if (!canWrite) return null;
      const now = Date.now();
      const note = {
        id: crypto.randomUUID(),
        title: "",
        body: "",
        text: "",
        colour: "plain",
        pinned: false,
        blockId: null,
        taskId: null,
        showOn: null,
        // a new note has no cover; undefined only where the database can't keep one yet
        cover: notesSupport().trash ? null : undefined,
        createdAt: now,
        updatedAt: now,
        ...fields,
      };
      setNotes((prev) => [note, ...prev]);
      // saved straight away, empty or not — every note is kept
      saveNoteSoon(userId, note, 0);
      return note;
    },
    [canWrite, userId],
  );

  const editNote = useCallback(
    (id, patch) => {
      if (!canWrite) return;
      const current = notes.find((n) => n.id === id);
      if (!current) return;
      const next = { ...current, ...patch, updatedAt: Date.now() };
      if ("body" in patch) next.text = toPlain(patch.body);
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, text: next.text, updatedAt: next.updatedAt } : n)));
      saveNoteSoon(userId, next);
      // something written in a note that lives in a category: the What's new step (not the empty note)
      if (next.categoryId && (next.title?.trim() || next.text?.trim())) markStep("note-in-category");
    },
    [canWrite, userId, notes],
  );

  // `block` null makes them day notes; notes already there are left alone
  const moveNotes = useCallback(
    (ids, block) => {
      if (!canWrite) return;
      const blockId = block?.id ?? null;
      const moving = new Set(ids);
      const at = Date.now();
      const moved = notes
        .filter((n) => moving.has(n.id) && (n.blockId ?? null) !== blockId)
        .map((n) => ({ ...n, blockId, updatedAt: at }));
      if (moved.length === 0) return;
      const byId = new Map(moved.map((n) => [n.id, n]));
      setNotes((prev) => prev.map((n) => byId.get(n.id) ?? n));
      moved.forEach((n) => saveNoteSoon(userId, n, 0));
      playTask();
      showMovedToast({ count: moved.length, to: block, noun: "note" });
    },
    [canWrite, userId, notes],
  );

  // into Trash, with Undo; restoring later is the Trash tab's job
  const trashNotes = useCallback(
    (ids) => {
      const going = new Set(ids);
      const at = Date.now();
      const removed = notes.filter((n) => going.has(n.id) && !n.deletedAt);
      if (removed.length === 0) return;
      const set = (deletedAt) => {
        const next = new Map(removed.map((n) => [n.id, { ...n, deletedAt }]));
        setNotes((prev) => prev.map((n) => next.get(n.id) ?? n));
        next.forEach((n) => saveNoteSoon(userId, n, 0));
      };
      set(at);
      playTuck();
      const one = removed.length === 1;
      showUndoToast({
        title: `${removed.length} ${one ? "note" : "notes"} moved to Trash`,
        hint: one ? "It stays there until you delete it for good." : "They stay there until you delete them for good.",
        onCommit: () => {},
        onUndo: () => {
          playTask();
          set(null);
        },
      });
    },
    [userId, notes],
  );

  // out of Trash, back where they were
  const restoreNotes = useCallback(
    (ids) => {
      if (!canWrite) return;
      const back = new Set(ids);
      const restored = notes.filter((n) => back.has(n.id) && n.deletedAt).map((n) => ({ ...n, deletedAt: null }));
      if (restored.length === 0) return;
      const byId = new Map(restored.map((n) => [n.id, n]));
      setNotes((prev) => prev.map((n) => byId.get(n.id) ?? n));
      restored.forEach((n) => saveNoteSoon(userId, n, 0));
      playTask();
      showMovedToast({ count: restored.length, to: { name: "your notes" }, noun: "note" });
    },
    [canWrite, userId, notes],
  );

  // gone from the screen now, gone from the database only once Undo has had its few seconds
  const deleteForever = useCallback(
    (ids) => {
      if (!canWrite) return;
      const going = new Set(ids);
      const removed = notes.filter((n) => going.has(n.id));
      if (removed.length === 0) return;
      setNotes((prev) => prev.filter((n) => !going.has(n.id)));
      playTuck();

      const one = removed.length === 1;
      showUndoToast({
        title: `${removed.length} ${one ? "note" : "notes"} deleted for good`,
        hint: one ? "You can still bring it back." : "You can still bring them back.",
        onCommit: () => removed.forEach((n) => deleteNoteForGood(n.id)),
        onUndo: () => {
          playTask();
          setNotes((prev) => [...removed, ...prev.filter((n) => !going.has(n.id))].sort(newestFirst));
        },
      });
    },
    [canWrite, notes],
  );

  // Trash first, when there is one; otherwise straight to the for-good delete above
  const removeNotes = useCallback(
    (ids) => {
      if (!canWrite) return;
      if (trashReady) trashNotes(ids);
      else deleteForever(ids);
    },
    [canWrite, trashReady, trashNotes, deleteForever],
  );

  // into a category (or subcategory), as a drop onto it in the tree does; notes already there stay put
  // category null takes them out of whatever category they were in
  const fileNotes = useCallback(
    (ids, category) => {
      if (!canWrite) return;
      const to = category?.id ?? null;
      const filing = new Set(ids);
      const at = Date.now();
      const moved = notes.filter((n) => filing.has(n.id) && (n.categoryId ?? null) !== to).map((n) => ({ ...n, categoryId: to, updatedAt: at }));
      if (moved.length === 0) return;
      const byId = new Map(moved.map((n) => [n.id, n]));
      setNotes((prev) => prev.map((n) => byId.get(n.id) ?? n));
      moved.forEach((n) => saveNoteSoon(userId, n, 0));
      playTask();
      showMovedToast({ count: moved.length, to: { name: category ? category.name || "Untitled" : "no category" }, noun: "note" });
    },
    [canWrite, userId, notes],
  );

  // categories deleted for good: the database has already let their notes go (on delete set null),
  // so this only catches the screen up — and keeps a later save from naming a category that's gone
  const forgetCategories = useCallback((ids) => {
    const gone = new Set(ids);
    setNotes((prev) => prev.map((n) => (gone.has(n.categoryId) ? { ...n, categoryId: null } : n)));
  }, []);

  // opening a note stamps it for Recent; it never counts as an edit
  const markOpened = useCallback(
    (id) => {
      if (!canWrite) return;
      const at = Date.now();
      setOpened((o) => ({ ...(o ?? {}), [id]: at }));
      saveOpen(userId, id, at);
    },
    [canWrite, userId],
  );

  const live = useMemo(() => notes.filter((n) => !n.deletedAt), [notes]);
  const trashed = useMemo(() => notes.filter((n) => n.deletedAt), [notes]);

  const value = useMemo(
    () => ({
      notes: live,
      trashed,
      trashReady,
      opened,
      hydrated,
      loadFailed,
      canWrite,
      addNote,
      editNote,
      moveNotes,
      removeNotes,
      restoreNotes,
      deleteForever,
      fileNotes,
      forgetCategories,
      markOpened,
    }),
    [live, trashed, trashReady, opened, hydrated, loadFailed, canWrite, addNote, editNote, moveNotes, removeNotes, restoreNotes, deleteForever, fileNotes, forgetCategories, markOpened],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
  return ctx;
}
