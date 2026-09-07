"use client";

/* Notes.
 *
 * Two states, one page. Closed, it's a grid of cards. Open a note and the page
 * splits: a sidebar on the left that keeps the whole shelf within reach, and
 * the note itself on the right with room to write. No dialog — a note you're
 * writing shouldn't sit in a box on top of the thing you left.
 *
 * A note has a category, and the category is the colour, in both views. That's
 * the whole filing system: you don't read the shelf, you recognise it.
 *
 * Deliberately no "last edited 4 days ago", no counts, no empty-state nagging.
 * A note you haven't touched in a month is just a note. The date on a card is
 * the day you wrote it — a fact, not a reproach.
 *
 * Lives in localStorage under its own key, separate from the day. Notes are not
 * part of the day lifecycle and must never be swept by the daily reset.
 */

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { IconInput } from "@/components/ui/icon-input";
import { NoteEditor } from "@/components/app/note-editor";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { id: "ideas", name: "Ideas", bg: "#F5C542" },
  { id: "work", name: "Work", bg: "#8FC7F5" },
  { id: "life", name: "Life", bg: "#F5A3B7" },
  { id: "learning", name: "Learning", bg: "#86D9A8" },
  { id: "later", name: "Later", bg: "#F5836A" },
];

const byId = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const colourOf = (id) => byId[id]?.bg ?? "#E8E8E8";

const SEED = [
  {
    id: "n1",
    title:
      "The beginning of screenless design: UI jobs to be taken over by Solution Architect",
    body: "",
    category: "ideas",
    date: "May 21, 2020",
    starred: false,
  },
  {
    id: "n2",
    title:
      "13 Things You Should Give Up If You Want To Be a Successful UX Designer",
    body: "",
    category: "learning",
    date: "May 25, 2020",
    starred: true,
  },
];

/* The date is stamped as a STRING when the note is written, not formatted from
   an epoch at render. Formatting on the fly makes the server and the browser
   disagree whenever their timezones do, and React reports that as a hydration
   mismatch. */
const today = () =>
  new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

function useNotes() {
  const [notes, setNotes] = useState(SEED);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("milo:notes");
      if (raw) setNotes(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem("milo:notes", JSON.stringify(notes));
    } catch {}
  }, [hydrated, notes]);

  return [notes, setNotes, hydrated];
}

/* One shelf row. Same colour as the note's card in the grid, so moving between
   the two views never costs you your bearings. */
function ShelfRow({ note, active, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(note.id)}
      title={note.title || "Untitled"}
      /* The open note is the one at full strength; the rest of the shelf
         steps back. An outline around it was saying a thing the top of the
         list and the whole right-hand pane already said. */
      className={`flex w-full shrink-0 cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-opacity ${
        active ? "opacity-100" : "opacity-55 hover:opacity-85"
      }`}
      style={{ background: colourOf(note.category) }}
    >
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-black/85">
        {note.title || <span className="text-black/40">Untitled</span>}
      </span>
      {note.starred && (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black">
          <Star className="size-3 fill-[#F5C542] text-[#F5C542]" />
        </span>
      )}
    </button>
  );
}

function CategoryPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {CATEGORIES.map((c) => {
        const on = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-shadow ${
              on ? "ring-2 ring-black/50" : "ring-1 ring-black/10"
            }`}
            style={{ background: `${c.bg}40` }}
          >
            <span className="size-2 rounded-full" style={{ background: c.bg }} />
            {c.name}
          </button>
        );
      })}
    </div>
  );
}

/* Held while localStorage is read. Two shapes, because the page has two:
   the grid when nothing is open, the shelf when a note is.

   Grey, never a category colour — a coloured placeholder would read as a
   note you have and then turn into a different one. */
function GridSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="aspect-square rounded-3xl bg-black/[0.04]" />
      ))}
    </div>
  );
}

function ShelfSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-2">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-12 w-full rounded-xl bg-black/[0.04]" />
      ))}
    </div>
  );
}

export default function NotesPage() {
  const [notes, setNotes, hydrated] = useNotes();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (filter !== "all" && n.category !== filter) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    });
  }, [notes, query, filter]);

  const open = notes.find((n) => n.id === openId) ?? null;

  /* The one you're reading goes to the top of the shelf. Display only — the
     stored order never moves, so closing the note puts the grid back exactly
     as it was. */
  const shelf = useMemo(() => {
    if (!openId) return results;
    const i = results.findIndex((n) => n.id === openId);
    if (i <= 0) return results;
    const next = [...results];
    next.unshift(next.splice(i, 1)[0]);
    return next;
  }, [results, openId]);

  const update = (next) =>
    setNotes((prev) => prev.map((n) => (n.id === next.id ? next : n)));

  const add = () => {
    const note = {
      id: `n${Date.now()}`,
      title: "",
      body: "",
      category: filter === "all" ? "ideas" : filter,
      date: today(),
      starred: false,
    };
    setNotes((prev) => [note, ...prev]);
    setOpenId(note.id); // straight into writing — that's what the button is for
  };

  const remove = () => {
    setNotes((prev) => prev.filter((n) => n.id !== openId));
    setOpenId(null);
  };

  const search = (
    <IconInput
      icon={<Search className="size-4" />}
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search your notes"
      aria-label="Search notes"
    />
  );

  /* ---------------------------------------------------------------- open --
     Sidebar plus the note. The sidebar is the whole shelf, still filterable,
     so moving to the next note never means going back first. */
  if (open) {
    return (
      <div className="flex h-full min-h-0">
        <aside className="flex w-72 shrink-0 flex-col gap-4 border-r border-black/8 px-5 py-5">
          <button
            type="button"
            onClick={() => setOpenId(null)}
            className="flex cursor-pointer items-center gap-2 text-left text-2xl font-semibold tracking-tight transition-opacity hover:opacity-70"
          >
            <ArrowLeft className="size-5 text-black/35" />
            Notes
          </button>

          {search}

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by category"
            className="h-[40px] w-full cursor-pointer rounded-[10px] border-[1.5px] border-black/20 bg-transparent px-[10px] text-sm text-black outline-none transition-colors duration-200 focus:border-[#5e17eb]"
          >
            <option value="all">All</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-1 pb-1">
            {!hydrated && <ShelfSkeleton />}

            {hydrated &&
              shelf.map((n) => (
                <ShelfRow
                  key={n.id}
                  note={n}
                  active={n.id === openId}
                  onOpen={setOpenId}
                />
              ))}

            {hydrated && results.length === 0 && (
              <p className="px-1 pt-1 text-xs text-black/35">
                Nothing here under that.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={add}
            aria-label="Add note"
            className="flex w-full shrink-0 cursor-pointer items-center justify-center rounded-xl bg-black py-3 text-white transition-opacity hover:opacity-85"
          >
            <Plus className="size-5" />
          </button>
        </aside>

        {/* The pane wears the note's own colour, at a tenth of its strength.
            A Work note and an Ideas note should not feel like the same room,
            but you have to be able to write on it — so this is a tint, not
            the card colour. Changing it is the category chips below; there
            is deliberately no second colour system to keep in step. */}
        <section
          className="notes-tinted flex min-h-0 min-w-0 flex-1 flex-col px-8 py-6 transition-colors duration-500"
          style={{ background: `${colourOf(open.category)}1A` }}
        >
          <div className="flex items-start justify-between gap-4">
            <input
              value={open.title}
              onChange={(e) => update({ ...open, title: e.target.value })}
              placeholder="Untitled"
              aria-label="Title"
              className="min-w-0 flex-1 bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-black/20"
            />

            <div className="flex shrink-0 items-center gap-4">
              <button
                type="button"
                onClick={() => update({ ...open, starred: !open.starred })}
                aria-label={open.starred ? "Unstar" : "Star"}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-black transition-opacity hover:opacity-80"
              >
                {/* on a black circle the off state has to be a light grey —
                    black/35 was there for a transparent button and disappeared
                    the moment the background went dark */}
                <Star
                  className={`size-4 ${open.starred ? "fill-[#F5C542] text-[#F5C542]" : "text-white/40"}`}
                />
              </button>
              <Button
                variant="destructive"
                onClick={remove}
                aria-label="Delete note"
                className="flex size-9 cursor-pointer items-center justify-center rounded-full text-black/35 transition-colors hover:bg-black/5 hover:text-black/70"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pb-4 pt-3">
            <span className="text-lg text-black/50">{open.date}</span>
          </div>

          {/* header ends here  */}

          <NoteEditor
            noteId={open.id}
            body={open.body}
            onChange={(html) => update({ ...open, body: html })}
          />
        </section>
      </div>
    );
  }

  /* -------------------------------------------------------------- closed -- */
  return (
    <div className="flex h-full flex-col px-6 pt-5 sm:px-10">
      {/* Pinned — search, title and filters stay while the notes scroll */}
      <div className="flex shrink-0 flex-col gap-6 pb-6">
        <div className="max-w-xs">{search}</div>

        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Notes
        </h1>

        {/* Chips, not folders. Nothing to create, nothing to maintain, and
            every one of them is always there whether it holds anything or
            not — an empty category is not a gap. */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs transition-colors ${
              filter === "all"
                ? "bg-black text-white"
                : "text-black/45 ring-1 ring-black/10 hover:text-black/70"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => {
            const on = filter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(on ? "all" : c.id)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-shadow ${
                  on ? "ring-2 ring-black/50" : "ring-1 ring-black/10"
                }`}
                style={{ background: on ? `${c.bg}55` : "transparent" }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: c.bg }}
                />
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
        {!hydrated ? (
          <GridSkeleton />
        ) : results.length === 0 && query.trim() !== "" ? (
          <p className="text-sm text-black/40">Nothing matches “{query}”.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {results.map((note) => (
              <article
                key={note.id}
                onClick={() => setOpenId(note.id)}
                className="group/note relative flex aspect-square min-w-0 cursor-pointer flex-col justify-between rounded-3xl p-6 transition-transform duration-200 hover:-translate-y-1 motion-reduce:transform-none"
                style={{ background: colourOf(note.category) }}
              >
                {note.starred && (
                  <span className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full bg-black">
                    <Star className="size-4 fill-[#F5C542] text-[#F5C542]" />
                  </span>
                )}

                <h2 className="line-clamp-5 pr-10 text-lg leading-snug font-medium wrap-break-word text-black/85">
                  {note.title || <span className="text-black/35">Untitled</span>}
                </h2>

                <div className="flex items-end justify-between gap-3">
                  <span className="text-sm text-black/55">{note.date}</span>
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform duration-200 group-hover/note:scale-105 motion-reduce:transform-none"
                  >
                    <Pencil className="size-4" />
                  </span>
                </div>
              </article>
            ))}

            {/* Same footprint as a note, so the grid reads as one row of
               cards rather than a list plus a button bolted on. Hidden while
               searching — it is not a search result. */}
            {query.trim() === "" && (
              <button
                type="button"
                onClick={add}
                className="flex aspect-square min-w-0 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-black/12 text-black/40 transition-colors duration-200 hover:border-black/25 hover:text-black/60"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-black text-white">
                  <Plus className="size-4" />
                </span>
                <span className="text-sm">Add note</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
