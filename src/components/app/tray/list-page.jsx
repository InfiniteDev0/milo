"use client";

// Slide 0. Carries the sheet's own title and close — the note slide has its own.

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { shade } from "@/lib/shade";
import { Empty } from "./empty";
import { NoteRow } from "./note-row";
import { Search } from "./search";

export function ListPage({ notes, onAdd, onOpen }) {
  const [query, setQuery] = useState("");

  // `text` is the whole note, not the 140-char preview — searching the preview
  // would only ever find the opening line.
  const q = query.trim().toLowerCase();
  const shown = q
    ? notes.filter((n) =>
        `${n.title ?? ""} ${n.text ?? ""}`.toLowerCase().includes(q),
      )
    : notes;

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-4 pb-3">
        {/* plural — more than one can land here in a day */}
        <DialogPrimitive.Title className="text-xl font-medium">
          Today&rsquo;s notes
        </DialogPrimitive.Title>

        <div className="flex items-center gap-2">
          {notes.length > 0 && (
            <button
              type="button"
              onClick={onAdd}
              aria-label="New note"
              style={{ "--lift": shade("#141414", 0.6) }}
              className="milo-lift flex size-9 cursor-pointer items-center justify-center rounded-xl bg-[#141414] text-white"
            >
              <Plus className="size-4" />
            </button>
          )}

          <DialogPrimitive.Close
            aria-label="Close"
            style={{ "--lift": shade("#ffffff", 0.16) }}
            className="milo-lift flex size-9 cursor-pointer items-center justify-center rounded-xl border border-black/10 bg-white text-black/50 transition-colors hover:text-black"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="min-h-0 flex-1 pb-8">
          <Empty onAdd={onAdd} />
        </div>
      ) : (
        <>
          {/* pb-24 clears the floating search so the last note is never under it */}
          <div className="scrollbar-pill flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-5 pb-24">
            {shown.length === 0 ? (
              <p className="pt-8 text-center text-sm text-black/35">
                Nothing matches that.
              </p>
            ) : (
              shown.map((n) => <NoteRow key={n.id} note={n} onOpen={onOpen} />)
            )}
          </div>

          <Search value={query} onChange={setQuery} />
        </>
      )}
    </div>
  );
}
