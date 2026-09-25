"use client";

// Pin notes or blocks to a page. A tick means it's on the page; tapping again takes it off.

import { useState } from "react";
import { Check } from "lucide-react";
import { matchesSearch } from "@/lib/note-search";
import { useBlocks } from "../blocks-provider";
import { useNotes } from "../notes-provider";

export function PinMenu({ page, onPatch }) {
  const [tab, setTab] = useState("notes");
  const [query, setQuery] = useState("");
  const { notes } = useNotes();
  const { blocks, droppedToday } = useBlocks();
  const shown = notes.filter((n) => matchesSearch(n, query)).slice(0, 40);

  const toggle = (field, id) =>
    onPatch({ [field]: page[field].includes(id) ? page[field].filter((x) => x !== id) : [...page[field], id] }, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 rounded-lg bg-foreground/5 p-0.5 text-xs">
        {["notes", "blocks"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 cursor-pointer rounded-md py-1 capitalize ${tab === t ? "bg-card shadow-sm" : "text-foreground/55"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "notes" ? (
        <>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a note…"
            aria-label="Find a note"
            className="h-8 rounded-lg bg-foreground/5 px-2.5 text-xs outline-none placeholder:text-foreground/40"
          />
          <div className="scrollbar-pill flex max-h-60 flex-col gap-0.5 overflow-y-auto">
            {shown.length === 0 && <p className="px-2 py-3 text-center text-xs text-foreground/40">No notes found.</p>}
            {shown.map((n) => (
              <Row key={n.id} on={page.notes.includes(n.id)} onClick={() => toggle("notes", n.id)}>
                <span className="truncate">{n.title || n.text || "Untitled"}</span>
              </Row>
            ))}
          </div>
        </>
      ) : (
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {[...blocks, ...droppedToday].map((b) => (
            <Row key={b.id} on={page.blocks.includes(b.id)} onClick={() => toggle("blocks", b.id)}>
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.bg }} />
              <span className="truncate">{b.name.replace(" Block", "")}</span>
            </Row>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ on, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-foreground/5"
    >
      {children}
      {on && <Check className="ml-auto size-3.5 shrink-0" />}
    </button>
  );
}
