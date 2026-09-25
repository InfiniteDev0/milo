"use client";

// One open journal: its pages from the database, which spread you're on, a page mid-turn, and every change, saved as you go.
// The book is read in slots (see layOut), so every index here is a slot, not a place in the page list.

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { deletePageForGood, savePageSoon } from "@/lib/db/journal-queue";
import { addVoice, deleteVoice, listPages, listVoice } from "@/lib/db/journals";
import { hasContent, layOut, newPage } from "./pages";

export function useJournalBook(journal, userId) {
  const [pages, setPages] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [spread, setSpread] = useState(0);
  // 1 while a page turns on, -1 while one turns back, 0 when still
  const [flip, setFlip] = useState(0);
  // page id -> its voice notes, fetched a spread at a time
  const [voices, setVoices] = useState({});
  const fetched = useRef(new Set());
  // the newest pages, so a change never builds on a render that is already out of date
  const latest = useRef([]);

  useEffect(() => {
    let live = true;
    listPages(journal.id)
      .then((list) => {
        if (!live) return;
        latest.current = list;
        setPages(list);
        // opens on the newest spread, where you left off
        setSpread(Math.max(0, Math.floor((layOut(list).length - 1) / 2)));
      })
      .catch((err) => {
        console.warn("[milo] couldn't load the journal", err);
        if (live) setLoadFailed(true);
      });
    return () => {
      live = false;
    };
  }, [journal.id]);

  const slots = pages ? layOut(pages) : [];

  // puts the new page list in place and saves the pages that changed
  const commit = useCallback(
    (next, changed, wait) => {
      latest.current = next;
      setPages(next);
      if (userId) for (const p of changed) savePageSoon(userId, p, wait);
    },
    [userId],
  );

  const lastPosition = () => latest.current.at(-1)?.position ?? 0;

  // writing on a slot past the last page makes the pages it needs; the one written on is a fresh, dated page
  const writeSlot = useCallback(
    (index, body) => {
      const list = latest.current;
      const now = layOut(list);
      const at = now[index];
      if (at === null) return;
      if (at) {
        const next = list.map((p) => (p.id === at.id ? { ...p, body } : p));
        commit(next, [next.find((p) => p.id === at.id)]);
        return;
      }
      const made = [];
      let pos = lastPosition();
      for (let i = now.length; i <= index; i += 1) {
        pos += 1;
        const mine = i === index;
        made.push(newPage(journal.id, pos, mine ? { heads: true, body } : {}));
      }
      commit([...list, ...made], made);
    },
    [commit, journal.id],
  );

  // a full page keeps what fits and hands the rest to the start of the page after it,
  // or to a new page slipped in when the next one is something else
  const flowOn = useCallback(
    (index, fit, rest) => {
      const list = latest.current;
      const at = layOut(list)[index];
      if (!at) return;
      const i = list.findIndex((p) => p.id === at.id);
      const after = list[i + 1];
      const kept = { ...at, body: fit };
      if (after && after.kind === "write" && !after.heads) {
        const carried = { ...after, body: rest + after.body };
        commit(list.map((p) => (p.id === at.id ? kept : p.id === after.id ? carried : p)), [kept, carried]);
        return;
      }
      const position = after ? (at.position + after.position) / 2 : at.position + 1;
      const fresh = newPage(journal.id, position, { body: rest });
      commit([...list.slice(0, i), kept, fresh, ...list.slice(i + 1)], [kept, fresh]);
    },
    [commit, journal.id],
  );

  const patchPage = useCallback(
    (id, patch, wait) => {
      const next = latest.current.map((p) => (p.id === id ? { ...p, ...patch } : p));
      commit(next, [next.find((p) => p.id === id)], wait);
    },
    [commit],
  );

  // New pages go at the end. An empty page waiting there is used rather than left blank behind them.
  // Returns nothing; the book turns to what was added.
  const addPages = useCallback(
    (fields) => {
      let list = latest.current;
      const last = list.at(-1);
      if (last && !hasContent(last) && !last.bookmarked && last.notes.length + last.blocks.length === 0) {
        deletePageForGood(last.id);
        list = list.slice(0, -1);
      }
      let pos = list.at(-1)?.position ?? 0;
      const made = fields.map((f) => newPage(journal.id, (pos += 1), f));
      const next = [...list, ...made];
      commit(next, made, 0);
      const where = layOut(next).indexOf(made[0]);
      setFlip(0);
      setSpread(Math.floor(where / 2));
    },
    [commit, journal.id],
  );

  // a day plan goes as a pair
  const removePage = useCallback(
    (id) => {
      const list = latest.current;
      const page = list.find((p) => p.id === id);
      if (!page) return;
      const pair = page.kind.startsWith("day-")
        ? list.filter((p) => p.kind.startsWith("day-") && p.stamp === page.stamp)
        : [page];
      const going = new Set(pair.map((p) => p.id));
      for (const g of going) deletePageForGood(g);
      const next = list.filter((p) => !going.has(p.id));
      latest.current = next;
      setPages(next);
      setSpread((s) => Math.min(s, Math.max(0, Math.floor((layOut(next).length - 1) / 2))));
    },
    [],
  );

  // one turn at a time
  const turn = useCallback((dir) => setFlip((now) => now || dir), []);
  const endTurn = useCallback((dir) => {
    setSpread((s) => s + dir);
    setFlip(0);
  }, []);
  const jump = useCallback((to) => {
    setFlip(0);
    setSpread(to);
  }, []);

  // a fresh spread waits after the last one once its right page has something on it
  const n = slots.length;
  const lastSpread = n > 0 && n % 2 === 0 && hasContent(slots[n - 1]) ? n / 2 : Math.floor(Math.max(n - 1, 0) / 2);

  // the voice notes on the pages in view, and the pages either side, so a turn never waits
  const near = [spread * 2 - 2, spread * 2 - 1, spread * 2, spread * 2 + 1, spread * 2 + 2, spread * 2 + 3]
    .map((i) => slots[i]?.id)
    .filter(Boolean);
  const nearKey = near.join(",");
  useEffect(() => {
    const want = nearKey ? nearKey.split(",").filter((id) => !fetched.current.has(id)) : [];
    if (want.length === 0) return;
    for (const id of want) fetched.current.add(id);
    listVoice(want)
      .then((list) =>
        setVoices((v) => {
          const next = { ...v };
          for (const id of want) next[id] = list.filter((x) => x.pageId === id);
          return next;
        }),
      )
      .catch((err) => {
        console.warn("[milo] couldn't load voice notes", err);
        for (const id of want) fetched.current.delete(id);
      });
  }, [nearKey]);

  const recordVoice = useCallback(
    async (pageId, audio, seconds) => {
      const voice = { id: crypto.randomUUID(), pageId, audio, seconds };
      setVoices((v) => ({ ...v, [pageId]: [...(v[pageId] ?? []), voice] }));
      try {
        await addVoice(userId, voice);
      } catch (err) {
        console.warn("[milo] couldn't save a voice note", err);
        setVoices((v) => ({ ...v, [pageId]: (v[pageId] ?? []).filter((x) => x.id !== voice.id) }));
        toast("That voice note didn’t save. Try recording it again.");
      }
    },
    [userId],
  );

  const removeVoice = useCallback(async (pageId, id) => {
    let gone = null;
    setVoices((v) => {
      gone = (v[pageId] ?? []).find((x) => x.id === id);
      return { ...v, [pageId]: (v[pageId] ?? []).filter((x) => x.id !== id) };
    });
    try {
      await deleteVoice(id);
    } catch (err) {
      console.warn("[milo] couldn't delete a voice note", err);
      if (gone) setVoices((v) => ({ ...v, [pageId]: [...(v[pageId] ?? []), gone] }));
      toast("Couldn’t remove that voice note.");
    }
  }, []);

  return {
    pages,
    slots,
    loaded: pages !== null,
    loadFailed,
    spread,
    flip,
    lastSpread,
    turn,
    endTurn,
    jump,
    writeSlot,
    flowOn,
    patchPage,
    addPages,
    removePage,
    voices,
    recordVoice,
    removeVoice,
  };
}
