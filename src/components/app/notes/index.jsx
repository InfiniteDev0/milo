"use client";

// The Notes page: two ways to look at your notes, and a sheet to open one in.

import { useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { useNotes } from "../notes-provider";
import { NotePage } from "../tray/note-page";
import { AllNotes } from "./all-notes";
import { ByBlock } from "./by-block";

export function NotesView() {
  const { notes, hydrated, loadFailed, canWrite, addNote, editNote } = useNotes();
  const [byBlock, setByBlock] = useState(false);
  const [openId, setOpenId] = useState(null);
  const open = notes.find((n) => n.id === openId) ?? null;

  // `fields` carries the block when + is pressed on a block's card
  const add = (fields) => {
    const fresh = addNote(fields);
    if (fresh) setOpenId(fresh.id);
  };

  return (
    <div className="flex h-full flex-col px-6 pt-5 lg:px-8">
      <h1 className="shrink-0 pb-4 text-2xl">Notes</h1>

      <div className="flex shrink-0 items-center justify-between gap-3 pb-4">
        <h2 className="text-lg">{byBlock ? "Notes by block" : "All notes"}</h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setByBlock((v) => !v)}
            aria-pressed={byBlock}
            aria-label={byBlock ? "Show all notes" : "Group notes by block"}
            title={byBlock ? "All notes" : "By block"}
            className={`flex size-10 cursor-pointer items-center justify-center rounded-xl border transition-colors ${
              byBlock
                ? "border-foreground/30 text-foreground"
                : "border-foreground/10 text-foreground/55 hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="size-4" />
          </button>

          {canWrite && (
            <button
              type="button"
              onClick={() => add()}
              style={{ "--lift": "var(--solid-lift)" }}
              className="milo-lift flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-solid px-4 text-sm text-solid-ink hover:bg-solid-hover"
            >
              <Plus className="size-4" />
              Add note
            </button>
          )}
        </div>
      </div>

      <div className="scrollbar-pill min-h-0 flex-1 overflow-y-auto pb-8">
        {loadFailed ? (
          // a failed read knows nothing about your notes, so it never says there are none
          <p className="pt-16 text-center text-sm text-foreground/45">
            Couldn&rsquo;t reach your notes. Nothing you wrote is gone.
          </p>
        ) : !hydrated ? null : byBlock ? (
          <ByBlock
            notes={notes}
            canWrite={canWrite}
            onOpen={setOpenId}
            onAdd={(blockId) => add({ blockId })}
          />
        ) : (
          <AllNotes
            notes={notes}
            onOpen={setOpenId}
            onTogglePin={(n) => editNote(n.id, { pinned: !n.pinned })}
          />
        )}
      </div>

      <Sheet open={open !== null} onOpenChange={(o) => !o && setOpenId(null)} side="right">
        <NotePage
          note={open}
          onChange={(patch) => editNote(openId, patch)}
          onBack={() => setOpenId(null)}
        />
      </Sheet>
    </div>
  );
}
