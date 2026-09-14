"use client";

// Every note, shared by the notes sheet and the Notes page. Everything autosaves.
// A failed read writes nothing and never shows as "no notes" — the same rule the blocks provider keeps.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listNotes, toPlain } from "@/lib/db/notes";
import { saveNoteSoon } from "@/lib/db/note-queue";

const NotesContext = createContext(null);

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

  const value = useMemo(
    () => ({ notes, hydrated, loadFailed, canWrite, addNote, editNote }),
    [notes, hydrated, loadFailed, canWrite, addNote, editNote],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
  return ctx;
}
