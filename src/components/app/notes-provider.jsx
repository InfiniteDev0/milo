"use client";

// Every note, shared by the notes sheet and the Notes page. Everything autosaves.
// A failed read writes nothing and never shows as "no notes" — the same rule the blocks provider keeps.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { listNotes, toPlain } from "@/lib/db/notes";
import { deleteNoteForGood, saveNoteSoon } from "@/lib/db/note-queue";
import { playTask, playTuck } from "@/lib/sound";
import { DeletedToast } from "./notes/deleted-toast";
import { MovedToast } from "./notes/moved-toast";

const NotesContext = createContext(null);

// how long Undo stays on screen before a delete is real
const UNDO_MS = 6000;

const newestFirst = (a, b) => b.createdAt - a.createdAt;

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
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
        const list = await listNotes();
        if (!alive) return;
        setUserId(user?.id ?? null);
        setNotes(list);
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
        showOn: null,
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
      toast.custom(() => <MovedToast count={moved.length} to={block} />, {
        unstyled: true,
        id: "milo-notes-moved",
        duration: 3000,
      });
    },
    [canWrite, userId, notes],
  );

  // gone from the screen now, gone from the database only once Undo has had its few seconds
  const removeNotes = useCallback(
    (ids) => {
      if (!canWrite) return;
      const going = new Set(ids);
      const removed = notes.filter((n) => going.has(n.id));
      if (removed.length === 0) return;
      setNotes((prev) => prev.filter((n) => !going.has(n.id)));
      playTuck();

      const toastId = crypto.randomUUID();
      let settled = false;
      // sonner can report both a dismiss and an auto-close, so this runs once
      const commit = () => {
        if (settled) return;
        settled = true;
        removed.forEach((n) => deleteNoteForGood(n.id));
      };
      const undo = () => {
        if (settled) return;
        settled = true;
        toast.dismiss(toastId);
        playTask();
        setNotes((prev) => [...removed, ...prev.filter((n) => !going.has(n.id))].sort(newestFirst));
      };

      toast.custom(() => <DeletedToast count={removed.length} onUndo={undo} />, {
        unstyled: true,
        id: toastId,
        duration: UNDO_MS,
        onAutoClose: commit,
        onDismiss: commit,
      });
    },
    [canWrite, notes],
  );

  const value = useMemo(
    () => ({ notes, hydrated, loadFailed, canWrite, addNote, editNote, moveNotes, removeNotes }),
    [notes, hydrated, loadFailed, canWrite, addNote, editNote, moveNotes, removeNotes],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
  return ctx;
}
