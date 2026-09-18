"use client";

// One note, open: its title, its settings, and the same editor everywhere in Milo.
// Full screen widens the sheet to the window and keeps the writing in a readable column.

import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSpellcheck } from "@/hooks/use-spellcheck";
import { Button } from "@/components/ui/button";
import { NoteEditor } from "../note-editor";
import { NoteSettings } from "./note-settings";
import { CopyNoteButton, PinNoteButton } from "./note-actions";
import { noteColour, paperStyle } from "@/lib/note-colours";

export function NotePage({ note, onChange, onBack, full = false, onToggleFull }) {
  const spellcheck = useSpellcheck();
  if (!note) return null;

  return (
    // the note wears its colour, so choosing one is visible immediately
    <div className="milo-paper flex h-full flex-col" style={paperStyle(noteColour(note.colour))}>
      <div className="flex shrink-0 items-center gap-3 px-5 pt-4 pb-3">
        <Button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-8 w-8 cursor-pointer items-center gap-1 rounded-full text-sm text-foreground/45 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4 text-primary-foreground" />
        </Button>

        <input
          value={note.title}
          onChange={(e) => onChange({ title: e.target.value })}
          aria-label="Note title"
          spellCheck={spellcheck}
          placeholder="Title"
          className="min-w-0 flex-1 bg-transparent text-2xl outline-none placeholder:text-foreground/25"
        />

        <PinNoteButton note={note} onChange={onChange} />
        <CopyNoteButton note={note} />

        {onToggleFull && (
          <button
            type="button"
            onClick={onToggleFull}
            aria-pressed={full}
            aria-label={full ? "Leave full screen" : "Full screen"}
            title={full ? "Leave full screen" : "Full screen"}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-foreground transition-colors hover:bg-foreground/4"
          >
            {/* the icons trade places with a small turn, answering the press while the page grows */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={full ? "leave" : "enter"}
                initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex"
              >
                {full ? <Minimize2 className="size-4.5" /> : <Maximize2 className="size-4.5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        )}

        <NoteSettings note={note} onChange={onChange} />
      </div>

      {/* the editor's root is flex-1, and the pane supplies its side padding; text starts at the left, full screen or not */}
      <div className="flex min-h-0 flex-1 flex-col [&_.simple-editor-content]:px-5">
        {/* only the HTML goes up — the provider keeps the plain copy for search */}
        <NoteEditor noteId={note.id} body={note.body} onChange={(html) => onChange({ body: html })} />
      </div>
    </div>
  );
}
