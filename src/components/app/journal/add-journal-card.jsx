"use client";

// Beside your books: the way to start another journal, dressed like the add card on the Notes page.

import { Plus } from "lucide-react";
import { AddArt } from "../notes/add-art";

export function AddJournalCard({ onAdd }) {
  return (
    // the same footprint as a book card, so the two sit level side by side
    <div className="flex w-68 flex-col items-center justify-center gap-5 rounded-3xl bg-foreground/4 p-6">
      <AddArt className="h-auto w-44 text-foreground/75" />
      <button
        type="button"
        onClick={onAdd}
        style={{ "--lift": "var(--solid-lift)" }}
        className="milo-lift flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-solid px-4 text-sm text-solid-ink hover:bg-solid-hover"
      >
        <Plus className="size-4" />
        Add a new journal
      </button>
    </div>
  );
}
