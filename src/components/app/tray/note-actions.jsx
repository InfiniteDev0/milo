"use client";

// The two things you reach for on an open note without digging into settings: pin it, and copy it.

import { useEffect, useState } from "react";
import { Check, Copy, Pin } from "lucide-react";
import { noteToText } from "@/lib/note-text";

const ICON_BUTTON =
  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-foreground transition-colors hover:bg-foreground/4";

export function PinNoteButton({ note, onChange }) {
  const label = note.pinned ? "Unpin" : "Pin to the top";

  return (
    <button
      type="button"
      onClick={() => onChange({ pinned: !note.pinned })}
      aria-pressed={!!note.pinned}
      aria-label={label}
      title={label}
      className={ICON_BUTTON}
    >
      <Pin className={`size-4.5 ${note.pinned ? "" : "opacity-45"}`} fill={note.pinned ? "currentColor" : "none"} />
    </button>
  );
}

// the whole note as clean text, ready to paste into a message or another app
export function CopyNoteButton({ note }) {
  const [copied, setCopied] = useState(false);

  // the tick shows for a moment, then the button is ready again
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(noteToText(note.title, note.body));
      setCopied(true);
    } catch (err) {
      console.warn("[milo] could not copy the note", err);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy note"}
      title={copied ? "Copied" : "Copy note"}
      className={ICON_BUTTON}
    >
      {copied ? <Check className="size-4.5" /> : <Copy className="size-4.5 opacity-70" />}
    </button>
  );
}
