"use client";

// The pages of the open book, which two you're looking at, and a page mid-turn. Kept while the journal page is open; not saved yet.

import { useCallback, useState } from "react";

export function useBookPages() {
  const [pages, setPages] = useState([""]);
  // spread 0 shows pages 0 and 1, spread 1 shows 2 and 3…
  const [spread, setSpread] = useState(0);
  // 1 while a page turns on, -1 while one turns back, 0 when still
  const [flip, setFlip] = useState(0);

  const writePage = useCallback(
    (page, text) =>
      setPages((prev) => {
        const next = [...prev];
        next[page] = text;
        return next;
      }),
    [],
  );

  // a full page keeps what fits and hands the rest to the start of the next page
  const flowOn = useCallback(
    (page, fit, rest) =>
      setPages((prev) => {
        const next = [...prev];
        next[page] = fit;
        next[page + 1] = rest + (next[page + 1] ?? "");
        return next;
      }),
    [],
  );

  // one turn at a time
  const turn = useCallback((dir) => setFlip((now) => now || dir), []);
  const endTurn = useCallback((dir) => {
    setSpread((s) => s + dir);
    setFlip(0);
  }, []);

  // you can always turn to the next blank spread once there's writing on this one's right page
  const lastSpread = Math.max(0, Math.floor((pages.length - 1) / 2), (pages[spread * 2 + 1] ?? "") ? spread + 1 : 0);

  return { pages, spread, flip, turn, endTurn, writePage, flowOn, lastSpread };
}
