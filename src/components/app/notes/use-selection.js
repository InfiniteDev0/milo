"use client";

// Which notes are ticked. Only notes you can see count, so a filter can never hide a note you are about to delete.

import { useCallback, useState } from "react";

export function useSelection(visibleIds) {
  const [picked, setPicked] = useState(() => new Set());

  const selected = new Set([...picked].filter((id) => visibleIds.has(id)));

  const toggle = useCallback((id) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => setPicked(new Set()), []);

  return { selected, toggle, clear };
}
