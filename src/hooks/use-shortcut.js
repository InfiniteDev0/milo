"use client";

// One window-wide keyboard shortcut: Ctrl (⌘ on a Mac) + Shift + a letter. Ignored while you type, so it never fights the editor.

import { useEffect, useRef } from "react";

// true while focus sits in a field or in the note editor
const typing = () => {
  const el = document.activeElement;
  return Boolean(el) && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
};

export function useShortcut(key, onPress) {
  // the newest handler, without re-binding the listener every render
  const handler = useRef(onPress);
  useEffect(() => {
    handler.current = onPress;
  });

  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || !e.shiftKey || e.altKey) return;
      if (e.key.toLowerCase() !== key) return;
      if (typing()) return;
      e.preventDefault();
      handler.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key]);
}
