"use client";

// Beside the open book, on the left: search every page, the contents by month, and your bookmarks. A click turns straight there.

import { useState } from "react";
import { Bookmark, Search } from "lucide-react";
import { bookSerif } from "./font";
import { listed, pageDate, pageLabel, pageText, shortDate, snippet } from "./pages";

export function BookSidebar({ book, title, onJump }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("contents");
  const where = new Map(book.slots.map((p, i) => [p?.id, i]));
  const pages = book.pages ?? [];
  const q = query.trim();
  const go = (p) => onJump(Math.floor(where.get(p.id) / 2));

  const found = q ? pages.filter((p) => pageText(p).toLowerCase().includes(q.toLowerCase())) : [];
  const list = tab === "bookmarks" ? pages.filter((p) => p.bookmarked) : pages.filter(listed);

  // grouped under the month each page is about
  const groups = [];
  for (const p of list) {
    const d = pageDate(p);
    const name = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    if (groups.at(-1)?.name !== name) groups.push({ name, items: [] });
    groups.at(-1).items.push(p);
  }
  const current = new Set([book.slots[book.spread * 2]?.id, book.slots[book.spread * 2 + 1]?.id]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <p className={`${bookSerif.className} truncate px-1 text-xl italic`}>{title}</p>

      <label className="flex h-10 shrink-0 items-center gap-2.5 rounded-xl bg-foreground/5 px-3 text-foreground/50">
        <Search className="size-4 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this journal…"
          aria-label="Search this journal"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
        />
      </label>

      {q ? (
        <div className="scrollbar-pill flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {found.length === 0 && <p className="px-2 pt-4 text-sm text-foreground/40">Nothing matches that.</p>}
          {found.map((p) => (
            <Item key={p.id} onClick={() => go(p)} active={current.has(p.id)}>
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium">{pageLabel(p)}</span>
                <span className="shrink-0 text-xs text-foreground/40">{shortDate(pageDate(p))}</span>
              </span>
              <span className="line-clamp-2 text-xs text-foreground/55">{snippet(pageText(p), q)}</span>
            </Item>
          ))}
        </div>
      ) : (
        <>
          <div className="flex shrink-0 gap-1 rounded-xl bg-foreground/5 p-1 text-xs">
            {[
              ["contents", "Contents"],
              ["bookmarks", "Bookmarks"],
            ].map(([id, name]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex-1 cursor-pointer rounded-lg py-1.5 ${tab === id ? "bg-card shadow-sm" : "text-foreground/55"}`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="scrollbar-pill flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            {groups.length === 0 && (
              <p className="px-2 pt-4 text-sm text-foreground/40">
                {tab === "bookmarks" ? "Bookmark a page from its corner to find it here." : "Pages you start show up here."}
              </p>
            )}
            {groups.map((g) => (
              <div key={g.name} className="flex flex-col gap-0.5">
                <p className="px-2 pb-1 text-[11px] font-medium tracking-wide text-foreground/40 uppercase">{g.name}</p>
                {g.items.map((p) => (
                  <Item key={p.id} onClick={() => go(p)} active={current.has(p.id)}>
                    <span className="flex items-center gap-2">
                      {p.bookmarked && <Bookmark className="size-3 shrink-0 text-[#b8434a]" fill="currentColor" />}
                      <span className="truncate">{pageLabel(p)}</span>
                      <span className="ml-auto shrink-0 text-xs text-foreground/40">{shortDate(pageDate(p))}</span>
                    </span>
                  </Item>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Item({ onClick, active, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer flex-col gap-0.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-foreground/5 ${
        active ? "bg-foreground/5" : ""
      }`}
    >
      {children}
    </button>
  );
}
