"use client";

// One block's notes: its pill, a search, a + that files a new note straight into it, and the list.

import { useState } from "react";
import { Plus, Search } from "lucide-react";

const day = (ms) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export function BlockNotes({ block, notes, canWrite, onOpen, onAdd }) {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const shown = q
    ? notes.filter((n) => `${n.title ?? ""} ${n.text ?? ""}`.toLowerCase().includes(q))
    : notes;
  const name = block ? block.name.replace(" Block", "") : "Day notes";

  return (
    <section className="flex min-h-72 flex-col gap-3 rounded-2xl bg-foreground/[0.04] p-4">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`truncate rounded-lg px-3 py-1.5 text-sm font-medium ${
            block ? "" : "bg-card text-foreground ring-1 ring-foreground/10"
          }`}
          style={block ? { backgroundColor: block.bg, color: block.ink } : undefined}
        >
          {name}
        </span>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSearching((v) => !v);
              setQuery("");
            }}
            aria-pressed={searching}
            aria-label={`Search ${name}`}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-foreground/15 text-foreground/60 transition-colors hover:text-foreground"
          >
            <Search className="size-4" />
          </button>

          {canWrite && (
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Add a note to ${name}`}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-solid text-solid-ink hover:bg-solid-hover"
            >
              <Plus className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-foreground/45">
        <span>{block ? "All notes in this block" : "Notes that belong to the day"}</span>
        <span className="tabular-nums">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </span>
      </div>

      {searching && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${name}`}
          aria-label={`Search ${name}`}
          className="h-9 rounded-lg border border-foreground/10 bg-card px-3 text-sm outline-none focus:border-foreground/30"
        />
      )}

      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {shown.length === 0 ? (
          <li className="py-6 text-center text-xs text-foreground/35">
            {q ? "Nothing matches that." : "No notes here yet."}
          </li>
        ) : (
          shown.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => onOpen(n.id)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-card/70"
              >
                <span className="min-w-0 flex-1 truncate">{n.title?.trim() || "Untitled"}</span>
                <span className="shrink-0 text-[11px] text-foreground/35 tabular-nums">
                  {day(n.createdAt)}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
