"use client";

// Which note the Notes page sheet has open, and whose list its back arrow returns to.

import { useState } from "react";
import { useBlocks } from "../blocks-provider";

export function useNoteSheet() {
  const { blocks, droppedToday, archived } = useBlocks();
  const [state, setState] = useState({ open: false, scope: "day", noteId: null, page: "list", full: true });
  const known = new Set([...blocks, ...droppedToday, ...archived].map((b) => b.id));

  // back lands on the block the note belonged to when you opened it; no block, or a lost one, means the day
  const openNote = (note) =>
    setState({
      open: true,
      scope: note.blockId && known.has(note.blockId) ? note.blockId : "day",
      noteId: note.id,
      page: "note",
      // a note clicked on the page always starts full screen
      full: true,
    });

  // opened from the sheet's own list, so that list stays where back goes
  const showNote = (id) => setState((s) => ({ ...s, noteId: id, page: "note" }));
  // the note stays mounted while the slide glides away from it
  const back = () => setState((s) => ({ ...s, page: "list" }));
  const close = () => setState((s) => ({ ...s, open: false }));
  // the title switches the list to another block's notes, or the day's
  const setScope = (scope) => setState((s) => ({ ...s, scope, page: "list" }));
  const toggleFull = () => setState((s) => ({ ...s, full: !s.full }));

  return { state, openNote, showNote, back, close, toggleFull, setScope };
}
