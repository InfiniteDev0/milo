"use client";

// One note, open. The same Tiptap editor /notes uses — one editor in the app,
// so a day note that gets kept is already the right shape.

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteEditor } from "../note-editor";
import { NoteSettings } from "./note-settings";
import { noteColour } from "@/lib/note-colours";

// Search reads this, not the HTML, or a query would match tag names. Kept
// whole: the stack shows the first 140, search looks at all of it.
const plain = (html) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function NotePage({ note, onChange, onBack }) {
  if (!note) return null;

  return (
    // the note wears its colour, so choosing one is visible immediately
    <div className="milo-on-tint flex h-full flex-col" style={{ backgroundColor: noteColour(note.colour).bg }}>
      <div className="flex shrink-0 items-center gap-3 px-5 pt-4 pb-3">
        <Button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 cursor-pointer items-center gap-1 rounded-full text-sm text-foreground/45 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4 text-primary-foreground" />
        </Button>

        <input
          value={note.title}
          onChange={(e) => onChange({ title: e.target.value })}
          aria-label="Note title"
          placeholder="Title"
          className="min-w-0 flex-1 bg-transparent text-2xl outline-none placeholder:text-foreground/25"
        />

        <NoteSettings note={note} onChange={onChange} />
      </div>

      {/* flex column, because the editor's own root is flex-1.

          The editor SCSS sets no horizontal padding on purpose — "the pane
          supplies it" — so the writing is indented here to line up with the
          title. Only the content: the toolbar stays full width. */}
      <div className="flex min-h-0 flex-1 flex-col [&_.simple-editor-content]:px-5">
        <NoteEditor
          noteId={note.id}
          body={note.body}
          onChange={(html) => {
            const text = plain(html);
            onChange({ body: html, text, preview: text.slice(0, 140) });
          }}
        />
      </div>
    </div>
  );
}
