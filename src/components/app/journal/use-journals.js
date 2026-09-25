"use client";

// The journals on your shelf, from the database. Making one or changing its cover saves straight away.

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveJournalSoon } from "@/lib/db/journal-queue";
import { listJournals } from "@/lib/db/journals";
import { COVERS } from "./covers";

export function useJournals() {
  const [journals, setJournals] = useState([]);
  const [userId, setUserId] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const latest = useRef([]);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await createClient().auth.getUser();
        const list = await listJournals();
        if (!live) return;
        setUserId(user?.id ?? null);
        latest.current = list;
        setJournals(list);
      } catch (err) {
        console.warn("[milo] couldn't load journals", err);
        if (live) setLoadFailed(true);
      } finally {
        if (live) setHydrated(true);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  const canWrite = hydrated && !loadFailed && userId != null;

  const put = (next) => {
    latest.current = next;
    setJournals(next);
  };

  // the first is "My Journal"; after that they're numbered, and each wears the next cover
  const createJournal = useCallback(() => {
    if (!canWrite) return null;
    const count = latest.current.length;
    const journal = {
      id: crypto.randomUUID(),
      title: count === 0 ? "My Journal" : `Journal ${count + 1}`,
      cover: COVERS[count % COVERS.length].id,
      createdAt: Date.now(),
    };
    put([...latest.current, journal]);
    saveJournalSoon(userId, journal);
    return journal;
  }, [canWrite, userId]);

  const updateJournal = useCallback(
    (id, patch) => {
      if (!canWrite) return;
      const next = latest.current.map((j) => (j.id === id ? { ...j, ...patch } : j));
      put(next);
      saveJournalSoon(userId, next.find((j) => j.id === id), 600);
    },
    [canWrite, userId],
  );

  return { journals, userId, hydrated, loadFailed, canWrite, createJournal, updateJournal };
}
