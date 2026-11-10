"use client";

/* The top bar's search, laid out as Manasik's: an icon, Ctrl+K anywhere, and one
   panel — the field, what to look in (tabs with how many each has), and the
   results, one clean line each, grouped by kind. It finds anything in Milo:
   tasks (block and day), subtasks, notes and every word in them, blocks,
   categories and subcategories, journal pages and voice notes, and the pages
   themselves — by any word, a slip in the spelling allowed (match.js). Each
   result opens exactly what it is: a day task on its day, a note open, a
   journal on its page.

   Made for Milo, past where Manasik's stopped:
     why it matched   a result found inside its text (a note, a subtask, a journal page) shows
                      that bit, the words underlined, not just its first line
     days             "today", "friday", "nov 12" offer Go to that day and the tasks on it, on
                      top of the usual results; "groceries friday" narrows to that day
     create           what's typed can become a note, a category, or a task on the day named

   Nothing typed: what you opened this session, then the pages to go to.
   Recent lives in memory only — Milo keeps no app data in the browser. */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarArrowUp,
  CalendarCheck,
  CalendarPlus,
  FilePlus,
  FolderPlus,
  CornerDownLeftIcon,
  Folder,
  Mic,
  SearchIcon,
  SquareCheck,
  XIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { maskStyle } from "@/lib/mask";
import { addDayTaskSoon } from "@/lib/day-task-inbox";
import { jumpToDayLater } from "@/lib/jump-to-day";
import { VIEW } from "@/lib/view";
import { useCategories } from "../categories-provider";
import { useNotes } from "../notes-provider";
import { dayLabel, readDay } from "./days";
import { markStep } from "../whats-new/steps";
import { cn } from "@/lib/utils";
import { PickedIcon } from "../icon-picker/picked-icon";
import { UserGroup } from "../icons/user-group";
import { matchRanges, matchScore, normalize, queryWords, SLIP_SCORE } from "./match";
import { KIND_LABELS, SCOPES, useSearchEntries } from "./use-search-entries";

// the sidebar's own colours
const GREEN = "linear-gradient(135deg,#ffd600,#00d078)";
const PINK = "linear-gradient(135deg,#ff51e3,#1b4dff)";
// each page's sidebar icon, where it has one
const NAV_MASKS = { "Tasks view": "/home.svg", "Blocks view": "/home.svg", Notes: "/pencil.svg", Journal: "/notes.svg" };

const PER_KIND = 4; // the All tab shows this many of each kind before "Show all"
const PER_TAB = 60;
const SETTLE_MS = 140; // the typing settles this long before the results move

// opened this session, newest first: which results, never what's in them
let recentKeys = [];
const remember = (key) => {
  recentKeys = [key, ...recentKeys.filter((k) => k !== key)].slice(0, 8);
};

// grey at rest, as the sidebar's icons are; its colour on the row hovered or picked
function Mask({ file, gradient = GREEN, active }) {
  return (
    <span
      aria-hidden
      className={cn("size-5 shrink-0 transition-colors", !active && "bg-muted-foreground/70")}
      style={{ ...maskStyle(file), ...(active && { backgroundImage: gradient }) }}
    />
  );
}

// a result's icon, by what it is. A block's colour is the thing itself, so it always shows; the
// app's own icons colour in only on the active row
function ResultIcon({ entry, active }) {
  const tint = (colour) => cn("size-5 shrink-0 transition-colors", active ? colour : "text-muted-foreground/70");
  switch (entry.kind) {
    case "nav":
      // Shared notes: its own gradient icon, grey until the row is active
      if (entry.title === "Shared notes") return active ? <UserGroup className="size-5 shrink-0" /> : <UserGroup plain className="size-5 shrink-0 text-muted-foreground/70" />;
      return NAV_MASKS[entry.title] ? <Mask file={NAV_MASKS[entry.title]} active={active} /> : <Mask file="/calendar.svg" gradient={PINK} active={active} />;
    case "block":
      return <span aria-hidden className="size-4 shrink-0 rounded-sm" style={{ background: entry.colour }} />;
    case "task":
      return <SquareCheck className={tint("text-[#2f80ed]")} />;
    case "dayTask":
      return <CalendarCheck className={tint(entry.done ? "text-[#00b86b]" : "text-[#06b6d4]")} />;
    case "note":
      return <Mask file="/pencil.svg" active={active} />;
    case "category":
    case "subcategory":
      return entry.icon ? <PickedIcon icon={entry.icon} size={18} /> : <Folder className={tint("text-[#f5a524]")} />;
    case "entry":
      return <Mask file="/notes.svg" gradient={PINK} active={active} />;
    case "voice":
      return <Mic className={tint("text-[#ff51e3]")} />;
    case "goDay":
      return <CalendarArrowUp className={tint("text-[#06b6d4]")} />;
    case "newNote":
      return <FilePlus className={tint("text-[#00d078]")} />;
    case "newCategory":
      return <FolderPlus className={tint("text-[#f5a524]")} />;
    case "newTask":
      return <CalendarPlus className={tint("text-[#2f80ed]")} />;
    default:
      return null;
  }
}

function Key({ children }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center gap-0.5 rounded-md bg-muted px-1.5 font-sans text-[11px] font-semibold text-muted-foreground">
      {children}
    </kbd>
  );
}

// the title, with what was typed underlined
function Underlined({ text, words }) {
  const ranges = matchRanges(text, words);
  if (ranges.length === 0) return text;
  const parts = [];
  let at = 0;
  for (const [start, end] of ranges) {
    if (start > at) parts.push(text.slice(at, start));
    parts.push(
      <span key={start} className="underline decoration-foreground/40 decoration-[1.5px] underline-offset-4">
        {text.slice(start, end)}
      </span>,
    );
    at = end;
  }
  if (at < text.length) parts.push(text.slice(at));
  return parts;
}

const scopeOf = (kind) => SCOPES.find((s) => s.kinds?.includes(kind))?.id ?? "all";

// what's found, best first, newer first among equals; spelt right somewhere, the near misses are only noise
function rank(entries, words) {
  const found = entries
    .map((entry) => ({ entry, score: matchScore(entry.match, words) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.entry.date - a.entry.date);
  return found.some(({ score }) => score >= SLIP_SCORE) ? found.filter(({ score }) => score >= SLIP_SCORE) : found;
}

// the sections: Recent and Go to with nothing typed; what's found, by kind, once something is
function buildSections(entries, hits, scope, recent) {
  const kinds = SCOPES.find(({ id }) => id === scope)?.kinds ?? null;
  const inKinds = (kind) => !kinds || kinds.includes(kind);
  const inScope = entries.filter(({ kind }) => inKinds(kind));

  if (!hits) {
    const byKey = new Map(inScope.map((e) => [e.key, e]));
    const recentEntries = recent.flatMap((k) => byKey.get(k) ?? []);
    const recentSection = recentEntries.length ? [{ id: "recent", heading: "Recent", entries: recentEntries }] : [];
    if (scope !== "all") {
      const newest = [...inScope].sort((a, b) => b.date - a.date).slice(0, PER_TAB);
      return [...recentSection, { id: "latest", heading: scope === "pages" ? "Pages" : "Latest", entries: newest.filter((e) => !recentEntries.includes(e)) }];
    }
    return [...recentSection, { id: "nav", heading: "Go to", entries: inScope.filter(({ kind }) => kind === "nav") }];
  }

  const found = hits.filter(({ entry }) => inKinds(entry.kind));
  if (scope !== "all") return [{ id: scope, heading: "Results", entries: found.slice(0, PER_TAB).map(({ entry }) => entry) }];
  // All: each kind together, the kind with the best match first
  const byKind = new Map();
  for (const hit of found) byKind.set(hit.entry.kind, [...(byKind.get(hit.entry.kind) ?? []), hit]);
  return [...byKind]
    .sort((a, b) => b[1][0].score - a[1][0].score)
    .map(([kind, kindHits]) => ({
      id: kind,
      heading: KIND_LABELS[kind],
      entries: kindHits.slice(0, PER_KIND).map(({ entry }) => entry),
      more: kindHits.length > PER_KIND ? { count: kindHits.length, scope: scopeOf(kind) } : undefined,
    }));
}

// one result on one line: icon, name with the match underlined, what tells it apart, its pill — and Open while picked
// where the words turn up in a result's text, a few words either side — for one found inside it, not by its title
function snippetOf(text, words) {
  if (!text || words.length === 0) return null;
  const plain = normalize(text);
  const at = words.map((w) => plain.indexOf(w)).filter((i) => i >= 0).sort((a, b) => a - b)[0];
  if (at == null) return null;
  const start = Math.max(0, text.lastIndexOf(" ", Math.max(0, at - 32)) + 1);
  const end = Math.min(text.length, at + 70);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

function ResultRow({ entry, words, active, index, onHover, onOpen }) {
  // found inside, not by its name: show where
  const inside = matchRanges(entry.title, words).length === 0 ? snippetOf(entry.text, words) : null;
  return (
    <div
      role="option"
      aria-selected={active}
      data-index={index}
      onMouseMove={onHover}
      onClick={onOpen}
      className={cn("flex h-11 shrink-0 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm", active ? "bg-muted" : "hover:bg-muted/60")}
    >
      <ResultIcon entry={entry} active={active} />
      <span className={cn("min-w-0 shrink truncate text-[15px] font-medium text-foreground", entry.done && "text-muted-foreground line-through")}>
        <Underlined text={entry.title} words={words} />
      </span>
      {inside ? (
        <span className="min-w-0 flex-1 truncate text-muted-foreground">
          <Underlined text={inside} words={words} />
        </span>
      ) : entry.detail ? (
        <span className="min-w-0 flex-1 truncate text-muted-foreground">{entry.detail}</span>
      ) : (
        <span className="flex-1" />
      )}
      {entry.pill && (
        <span
          className={cn("inline-flex h-6 max-w-40 shrink-0 items-center truncate rounded-sm px-2.5 text-xs font-medium", !entry.pill.colour && "bg-muted text-muted-foreground")}
          style={entry.pill.colour ? { background: entry.pill.colour, color: entry.pill.ink } : undefined}
        >
          {entry.pill.label}
        </span>
      )}
      {active && (
        <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground text-background max-md:hidden">
          <CornerDownLeftIcon className="size-3.5" />
        </span>
      )}
    </div>
  );
}

// while the typing settles: grey lines where the results will be
function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-1 pt-1" aria-hidden>
      <span className="mb-2 h-3 w-16 animate-pulse rounded-full bg-muted" />
      {[92, 78, 86, 64, 72].map((w, i) => (
        <div key={i} className="flex h-11 items-center gap-3 px-2">
          <span className="size-5 shrink-0 animate-pulse rounded-md bg-muted" />
          <span className="h-3.5 animate-pulse rounded-full bg-muted" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

export function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // what the results are for: the typing, once it settles
  const [settled, setSettled] = useState("");
  const [scope, setScope] = useState("all");
  const [active, setActive] = useState(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const { entries, failed } = useSearchEntries(open);
  // opening it counts for the What's new step
  useEffect(() => {
    if (open) markStep("search");
  }, [open]);

  // Ctrl+K (⌘K on a Mac) opens it from anywhere and closes it again; the Milo panel can open it too
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((now) => !now);
      }
    };
    const show = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("milo:search", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("milo:search", show);
    };
  }, []);

  // the results follow the typing a moment later
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(query.trim() ? query : ""), query.trim() ? SETTLE_MS : 0);
    return () => window.clearTimeout(timer);
  }, [query]);
  const settling = query.trim() !== "" && query.trim() !== settled.trim();

  const words = queryWords(settled);
  const hits = useMemo(() => {
    const typed = queryWords(settled);
    return typed.length === 0 ? null : rank(entries, typed);
  }, [entries, settled]);
  const router = useRouter();
  const { addNote, canWrite: notesWritable } = useNotes();
  const categories = useCategories();
  // a day named in what's typed, and the words left once it's taken out
  const asked = useMemo(() => readDay(queryWords(settled)), [settled]);
  // what's typed, as typed, without the day: the title for anything made from it
  const typedTitle = useMemo(() => {
    if (!asked) return settled.trim();
    const keep = new Set(asked.words);
    return settled
      .trim()
      .split(/s+/)
      .filter((w) => keep.has(normalize(w)))
      .join(" ");
  }, [settled, asked]);

  const sections = useMemo(() => {
    const base = buildSections(entries, hits, scope, open ? recentKeys : []);
    if (!hits && !asked) return base;
    const extra = { before: [], after: [] };

    // the day named: go there, and the tasks on it (narrowed by any other words)
    if (asked && (scope === "all" || scope === "tasks")) {
      const time = asked.day.getTime();
      const onDay = entries.filter((e) => e.kind === "dayTask" && e.date === time && (asked.words.length === 0 || matchScore(e.match, asked.words) > 0));
      const go = {
        key: `goDay:${time}`,
        kind: "goDay",
        title: `Go to ${dayLabel(asked.day)}`,
        detail: onDay.length ? `${onDay.length} ${onDay.length === 1 ? "task" : "tasks"}` : "Nothing on it yet",
        run: () => {
          VIEW.set("tasks");
          jumpToDayLater(asked.day);
          router.push("/daily");
        },
      };
      extra.before.push({ id: "day", heading: dayLabel(asked.day), entries: [go, ...onDay] });
    }

    // what's typed, made into something
    const title = typedTitle;
    if (title && scope === "all") {
      const day = asked?.day ?? new Date(new Date().setHours(0, 0, 0, 0));
      const make = [
        {
          key: "new:task",
          kind: "newTask",
          title: `Add “${title}” to ${dayLabel(day).split(",")[0].toLowerCase() === "today" ? "today" : dayLabel(day)}`,
          run: () => {
            VIEW.set("tasks");
            addDayTaskSoon(day, title);
            jumpToDayLater(day);
            router.push("/daily");
          },
        },
      ];
      if (notesWritable) {
        make.push({
          key: "new:note",
          kind: "newNote",
          title: `New note “${title}”`,
          run: () => {
            const note = addNote({ title });
            if (note) router.push(`/notes?note=${note.id}`);
          },
        });
      }
      if (categories.canWrite) {
        make.push({
          key: "new:category",
          kind: "newCategory",
          title: `New category “${title}”`,
          run: () => {
            const c = categories.addCategory({ name: title });
            if (c) router.push(`/notes?category=${c.id}`);
          },
        });
      }
      extra.after.push({ id: "create", heading: "Create", entries: make });
    }

    // the day's own tasks aren't listed twice
    const shown = new Set(extra.before.flatMap((sec) => sec.entries.map((e) => e.key)));
    const rest = base.map((sec) => ({ ...sec, entries: sec.entries.filter((e) => !shown.has(e.key)) }));
    return [...extra.before, ...rest, ...extra.after];
  }, [entries, hits, scope, open, asked, typedTitle, router, addNote, notesWritable, categories]);
  const flat = sections.flatMap((s) => s.entries);
  // how many each tab has for what's typed
  const counts = useMemo(
    () => (hits ? new Map(SCOPES.map(({ id, kinds }) => [id, kinds ? hits.filter(({ entry }) => kinds.includes(entry.kind)).length : hits.length])) : null),
    [hits],
  );

  // the picked one: back to the top when what's shown changes, kept in view
  const [shownFor, setShownFor] = useState("");
  if (shownFor !== `${settled}|${scope}`) {
    setShownFor(`${settled}|${scope}`);
    setActive(0);
  }
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setSettled("");
    setScope("all");
  };

  const openEntry = (entry) => {
    remember(entry.key);
    close();
    // after the panel has gone, so what it opens takes the focus
    window.setTimeout(entry.run, 120);
  };

  const stepScope = (by) => {
    const at = SCOPES.findIndex(({ id }) => id === scope);
    setScope(SCOPES[(at + by + SCOPES.length) % SCOPES.length].id);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((n) => (flat.length === 0 ? 0 : (n + 1) % flat.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((n) => (flat.length === 0 ? 0 : (n - 1 + flat.length) % flat.length));
    } else if (e.key === "Enter") {
      const entry = flat[active];
      if (!entry) return;
      e.preventDefault();
      openEntry(entry);
    } else if (e.key === "Tab") {
      e.preventDefault();
      stepScope(e.shiftKey ? -1 : 1);
    }
  };

  let index = -1;

  return (
    <>
      <TooltipProvider delay={200}>
        <Tooltip>
          <TooltipTrigger
            render={<button type="button" data-tour="search" onClick={() => setOpen(true)} aria-label="Search" aria-keyshortcuts="Control+K" />}
            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-white/10"
          >
            <SearchIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8} className="flex items-center gap-2">
            Search
            <span className="opacity-60">Ctrl K</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
        <DialogContent
          showCloseButton={false}
          className="top-[12vh] translate-y-0 gap-0 overflow-hidden rounded-xl border border-border bg-white p-0 shadow-none ring-0 sm:max-w-3xl dark:bg-background"
          onKeyDown={onKeyDown}
        >
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogDescription className="sr-only">Search tasks, notes, blocks, categories, journal pages, voice notes and pages.</DialogDescription>

          {/* the field, with ✕ to clear it */}
          <div className="flex items-center gap-3 px-5 pt-4">
            <SearchIcon className="size-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, notes, blocks, journal…"
              aria-label="Search"
              role="combobox"
              aria-expanded
              aria-controls="search-results"
              autoComplete="off"
              spellCheck={false}
              className="h-12 min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground/70"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>

          {/* what to look in, underlined like the app's other tabs, with how many each has */}
          <div role="tablist" aria-label="Look in" className="flex gap-5 overflow-x-auto border-b px-5 pt-2 [scrollbar-width:none]">
            {SCOPES.map((option) => {
              const count = counts?.get(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  tabIndex={-1}
                  aria-selected={scope === option.id}
                  onClick={() => {
                    setScope(option.id);
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    "-mb-px flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 pb-2.5 text-sm transition-colors",
                    scope === option.id ? "border-foreground font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                  {count > 0 && option.id !== "all" && (
                    <span className="rounded-full bg-muted px-1.5 text-[11px] font-semibold tabular-nums text-muted-foreground">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* the results */}
          <div ref={listRef} id="search-results" role="listbox" aria-label="Results" className="scrollbar-pill flex h-[min(60vh,30rem)] flex-col overflow-y-auto px-3 py-3">
            {settling ? (
              <ResultsSkeleton />
            ) : flat.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center text-muted-foreground">
                {/* in dark mode its black and white swap, the yellow kept */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/illustrations/finding-seek.svg" alt="" width={200} height={200} className="mb-2 size-40 dark:hue-rotate-180 dark:invert" />
                <p className="text-sm font-medium text-foreground">{settled.trim() ? `Nothing found for “${settled.trim()}”` : "Nothing here yet"}</p>
                {settled.trim() && scope !== "all" && (
                  <button type="button" onClick={() => setScope("all")} className="cursor-pointer text-sm font-medium text-foreground underline underline-offset-4">
                    Look everywhere
                  </button>
                )}
              </div>
            ) : (
              sections.map((section) =>
                section.entries.length === 0 ? null : (
                  <div key={section.id} className="mb-2 flex flex-col" role="group" aria-label={section.heading}>
                    <div className="flex items-center justify-between px-3 pt-1 pb-1">
                      <p className="text-xs font-medium text-muted-foreground">{section.heading}</p>
                      {section.more && (
                        <button
                          type="button"
                          onClick={() => {
                            setScope(section.more.scope);
                            inputRef.current?.focus();
                          }}
                          className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          Show all {section.more.count}
                        </button>
                      )}
                    </div>
                    {section.entries.map((entry) => {
                      index += 1;
                      const at = index;
                      return (
                        <ResultRow
                          key={`${section.id}:${entry.key}`}
                          entry={entry}
                          words={words}
                          active={active === at}
                          index={at}
                          onHover={() => setActive(at)}
                          onOpen={() => openEntry(entry)}
                        />
                      );
                    })}
                  </div>
                ),
              )
            )}
            {/* a part that couldn't be read is said, never passed off as nothing there */}
            {failed.length > 0 && !settling && (
              <p className="px-3 pt-2 text-xs text-muted-foreground">Couldn&rsquo;t search your {failed.join(" or ")} just now.</p>
            )}
          </div>

          {/* the keys */}
          <div className="flex items-center gap-4 border-t px-5 py-3 text-xs text-muted-foreground max-md:hidden">
            <span className="flex items-center gap-1.5">
              <Key>
                <ArrowUpIcon className="size-3" />
              </Key>
              <Key>
                <ArrowDownIcon className="size-3" />
              </Key>
              to move
            </span>
            <span className="flex items-center gap-1.5">
              <Key>
                <CornerDownLeftIcon className="size-3" />
              </Key>
              to open
            </span>
            <span className="flex items-center gap-1.5">
              <Key>Tab</Key>
              to switch
            </span>
            <span className="ms-auto flex items-center gap-1.5">
              <Key>Esc</Key>
              to close
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
