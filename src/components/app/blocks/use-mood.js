"use client";

// Milo's face holds a pose for a beat after something happens, then goes back to reacting on its own.

import { useCallback, useEffect, useRef, useState } from "react";

export function useMood() {
  // undefined means autonomous
  const [miloMood, setMiloMood] = useState(undefined);
  const timer = useRef(null);
  // consecutive completions, for the escalating lines
  const run = useRef(0);

  const holdMood = useCallback((mood, ms) => {
    setMiloMood(mood);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMiloMood(undefined), ms);
  }, []);

  const resetRun = useCallback(() => {
    run.current = 0;
  }, []);

  // one more in a row; returns the new count
  const bumpRun = useCallback(() => {
    run.current += 1;
    return run.current;
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { miloMood, holdMood, resetRun, bumpRun };
}
