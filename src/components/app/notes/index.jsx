"use client";

/* The Notes page, in two sections. On the left: search, Notes, the tree (your
   blocks, or categories to come) and Notes | Reminders at the bottom. On the
   right: All notes, By block, Recent, Favorite and Trash, then the notes as
   cards — or, with one open, the note itself. New opens a blank page there
   (for now); adding to a category makes a real note in it and opens it.
   Reminders aren't built yet.

   What's open lives in the address, so a refresh lands on it again:
   ?category= the category picked in the tree, ?note= an open note (with its
   category kept, so back returns to it), ?new (with &block=) a new one,
   ?shared the Shared page (blank for now).

   Every tab shows its count. Recent is the notes you opened today; Trash holds
   deleted notes until they're restored or deleted for good.

   The calendar beside New opens the date wheel: the day it settles on filters
   every tab (and a category) to the notes written that day, said by a chip with
   × to clear. Clicking the calendar again changes the day. The top bar's
   calendar steps aside on this page. Reminders will follow the same filter. */

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, CirclePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BOX, COUNT } from "../view-header";
import { useBlocks } from "../blocks-provider";
import { useNotes } from "../notes-provider";
import { CardsView } from "./cards-view";
import { NoteCardsSkeleton } from "./skeletons";
import { NotePage } from "../tray/note-page";
import { SidePanel } from "./side-panel";
import { usePreference } from "@/hooks/use-preference";
import { NOTES_SIDEBAR, SIDEBAR_KEY } from "@/lib/notes-sidebar";
import { usePhone } from "@/hooks/use-phone";
import { PanelLeft } from "lucide-react";
import { ComingSoonArt } from "../icons/coming-soon-art";
import { useCategories } from "../categories-provider";
import { TrashView } from "./trash-view";
import { CategoryPage } from "./category-page";
import { DateWheel } from "../workspace-menu/date-wheel";
import { CalendarMark } from "../icons/calendar-mark";
import { StylusNote } from "../icons/stylus-note";
import { Tip } from "../tasks-view/tip";
import { X } from "lucide-react";


export function NotesView() {
  const { notes, trashed, trashReady, opened, hydrated, loadFailed, canWrite, editNote, addNote, restoreNotes, deleteForever } = useNotes();
  // the cards need blocks as well as notes, or the page draws once as one Day notes card
  const { blocks, droppedToday, archived, hydrated: blocksReady } = useBlocks();
  // notes or reminders (the bottom tabs), and the block picked in the tree (null: every note)
  const [section, setSection] = useState("notes");
  const [place, setPlace] = useState(null);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  // the day the notes are filtered to (null: every day), and whether the wheel is open
  const [day, setDay] = useState(null);
  const [wheel, setWheel] = useState(false);
  // the left section, folded with « or Ctrl and backslash
  const side = usePreference(NOTES_SIDEBAR) === "open";
  const toggleSide = () => NOTES_SIDEBAR.set(NOTES_SIDEBAR.get() === "open" ? "closed" : "open");
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey || e.key !== SIDEBAR_KEY) return;
      e.preventDefault();
      toggleSide();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // phones: the side is a drawer over the page, shut until opened, and shut again once you pick
  const phone = usePhone();
  const [drawer, setDrawer] = useState(false);
  const picked = (fn) => (...args) => {
    setDrawer(false);
    fn(...args);
  };
  const categories = useCategories();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const page = params.has("note") ? { noteId: params.get("note") } : params.has("new") ? { blockId: params.get("block") } : null;
  // the category picked in the tree, shown on its own: its name, its total, its notes
  const categoryId = params.get("category");
  const category = categories.list.find((c) => c.id === categoryId) ?? null;
  const parent = category?.parentId ? categories.list.find((c) => c.id === category.parentId) : null;

  // keep: the category stays in the address under an open note, so back returns to it
  const navigate = ({ noteId, isNew, blockId, keep = categoryId, shared = false } = {}) => {
    const q = new URLSearchParams();
    if (shared) q.set("shared", "");
    if (noteId) q.set("note", noteId);
    else if (isNew) {
      q.set("new", "");
      if (blockId) q.set("block", blockId);
    }
    if (keep) q.set("category", keep);
    const address = q.toString().replace("new=", "new").replace("shared=", "shared");
    router.push(address ? `${pathname}?${address}` : pathname, { scroll: false });
  };
  // null: back to the list (the category, if one is picked); a noteId opens it; anything else is New
  const setPage = (next) => navigate(next?.noteId ? { noteId: next.noteId } : next ? { isNew: true, blockId: next.blockId, keep: null } : {});
  const setCategory = (id) => navigate({ keep: id });
  // a note made in a category (or subcategory), opened straight away
  const addToCategory = (id) => {
    const note = addNote({ categoryId: id });
    if (note) navigate({ noteId: note.id, keep: id });
  };
  const open = page?.noteId ? (notes.find((n) => n.id === page.noteId) ?? null) : null;
  // the Shared page: blank until shared notes are built
  const shared = params.has("shared") && !page;

  // a block picked in the tree narrows every tab to its notes
  const known = new Set([...blocks, ...droppedToday, ...archived].map((b) => b.id));
  const inPlace = (n) => (place == null ? true : place === "day" ? !n.blockId || !known.has(n.blockId) : n.blockId === place);
  // the day picked on the wheel: only the notes written that day
  const onDay = (n) => !day || new Date(n.createdAt).toDateString() === day.toDateString();
  const here = notes.filter((n) => inPlace(n) && onDay(n));
  const favorites = here.filter((n) => n.pinned);

  // opened today, the latest first; null when today's opens couldn't be read
  const recent = opened ? here.filter((n) => opened[n.id]).sort((a, b) => opened[b.id] - opened[a.id]) : null;

  const TABS = [
    { id: "all", label: "All notes", count: here.length },
    { id: "blocks", label: "By block", count: here.filter((n) => known.has(n.blockId)).length },
    { id: "recent", label: "Recent", count: recent?.length },
    { id: "favorite", label: "Favorite", count: favorites.length },
    { id: "trash", label: "Trash", count: trashReady ? trashed.length : undefined },
  ];
  // a category's notes, and its subcategories' with them
  const inCategoryIds = new Set(category ? [category.id, ...categories.list.filter((c) => c.parentId === category.id).map((c) => c.id)] : []);
  // a category is its own page with no date filter on it, so it shows all its notes
  const inCategory = notes.filter((n) => inCategoryIds.has(n.categoryId));
  // the wheel's years: from your first note to this year
  const thisYear = new Date().getFullYear();
  const firstYear = Math.min(thisYear, ...notes.map((n) => new Date(n.createdAt).getFullYear()));
  const wheelYears = Array.from({ length: thisYear - firstYear + 1 }, (_, i) => firstYear + i);
  const shown = tab === "favorite" ? favorites : tab === "recent" ? (recent ?? []) : here;

  // a New from a picked block is for that block
  // New makes a real note and opens it — in the block picked in By block, if there is one
  const add = () => {
    const note = addNote({ blockId: tab === "blocks" && place && place !== "day" ? place : null });
    if (note) navigate({ noteId: note.id, keep: null });
  };

  return (
    <div className="flex h-full min-h-0">
      {/* the wheel the calendar opens: the day it settles on filters the notes */}
      <DateWheel open={wheel} onOpenChange={setWheel} onPick={setDay} initial={day} years={wheelYears} />
      {/* an open note takes the whole page, so the side section steps aside */}
      {/* folded with « or the rail's »: it slides shut and open like an accordion */}
      {/* phones: a tap beside the drawer shuts it */}
      {!open && phone && drawer && <button type="button" aria-label="Close" onClick={() => setDrawer(false)} className="fixed inset-0 z-40 bg-black/30 md:hidden" />}
      {!open && (
        <div
          inert={phone ? !drawer : !side}
          className={cn(
            "flex shrink-0 overflow-hidden transition-[width,opacity,translate] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
            side ? "md:w-[17rem] md:opacity-100" : "md:w-0 md:opacity-0",
            // phones: slides in from the left over the page
            "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-[min(20rem,85vw)] max-md:bg-card max-md:pt-[env(safe-area-inset-top)] max-md:shadow-2xl",
            drawer ? "max-md:translate-x-0" : "max-md:-translate-x-full",
          )}
        >
        <SidePanel
          onClose={() => {
            if (phone) return setDrawer(false);
            // a hidden search would still filter: let it go with the section
            setQuery("");
            toggleSide();
          }}
          notes={notes}
          showBlocks={tab === "blocks"}
          section={section}
          onSection={(s) => {
            setSection(s);
            if (page) setPage(null);
          }}
          query={query}
          onQuery={setQuery}
          place={place}
          onPlace={picked((p) => {
            setPlace(p);
            if (page) setPage(null);
          })}
          categories={categories}
          category={category?.id ?? null}
          onCategory={picked(setCategory)}
          onCategoryAdd={canWrite ? picked(addToCategory) : undefined}
          onOpenNote={picked((n, id) => navigate({ noteId: n.id, keep: id }))}
          shared={shared}
          onShared={picked(() => navigate({ shared: true, keep: null }))}
        />
        </div>
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        {/* an open note takes the whole page: no tabs over it (it has its own back arrow) */}
        {/* tabs along the top, as the reference has them, and New at the end */}
        {/* one line for everything: the tabs fill the bar's height with their underline on its edge,
            and the boxes sit centred on the same line */}
        {/* a category is a page of its own, with its own bar */}
        {!open && !(category && !page) && (
          // phones: the row scrolls sideways, and starts with the way to the drawer
          <div className="flex h-11 shrink-0 items-center gap-5 scrollbar-none border-b border-border px-5 max-md:gap-4 max-md:overflow-x-auto max-md:px-3">
            <button type="button" onClick={() => setDrawer(true)} aria-label="Open the notes sidebar" className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground md:hidden">
              <PanelLeft className="size-5" />
            </button>
            {/* the blank new page needs a way back (an open note hides this row and has its own) */}
            {page && (
              <button
                type="button"
                onClick={() => setPage(null)}
                className={cn(BOX, "cursor-pointer gap-1 transition-colors hover:bg-muted")}
              >
                <ChevronLeft className="size-3.5" />
                Back
              </button>
            )}
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                // All notes is where the categories show: the What's new spotlight points here from By block
                data-tour={t.id === "all" ? "notes-all" : undefined}
                onClick={() => {
                  // one Trash for everything: its own page, opened on Notes
                  if (t.id === "trash") return router.push("/trash?tab=notes");
                  setTab(t.id);
                  // leaving By block lets go of the block picked in it; any tab lets go of a category
                  if (t.id !== "blocks") setPlace(null);
                  if (page || categoryId || shared) navigate({ keep: null });
                }}
                className={cn(
                  "-mb-px flex h-full cursor-pointer items-center gap-1.5 border-b-2 text-sm transition-colors",
                  tab === t.id && !page && !category && !shared
                    ? "border-foreground font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                {t.count != null && <span className={COUNT}>{t.count}</span>}
              </button>
            ))}
            {/* the day filter: its chip once one is set, then the calendar that opens the wheel */}
            <span className="ms-auto flex items-center gap-2">
              {day && (
                <span className={cn(BOX, "gap-1.5 border-(--theme-accent)/40 bg-(--theme-accent)/10 pe-1 text-(--theme-accent)")}>
                  Written {day.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: day.getFullYear() === thisYear ? undefined : "numeric" })}
                  <button
                    type="button"
                    onClick={() => setDay(null)}
                    aria-label="Clear the date filter"
                    className="flex size-5 cursor-pointer items-center justify-center rounded-sm transition-colors hover:bg-(--theme-accent)/15"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              )}
              <Tip label={day ? "Change the date" : "Filter by date"}>
                <button
                  type="button"
                  onClick={() => setWheel(true)}
                  aria-label="Filter by date"
                  // a bare icon: no edge, no fill
                  className={cn("flex size-7 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground", day && "text-(--theme-accent)")}
                >
                  <CalendarMark className="size-4" />
                </button>
              </Tip>
            </span>
            {canWrite && (
              <button
                type="button"
                onClick={add}
                // the page's one solid button: dark in light mode, white in dark (or the theme colour), no edge
                className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-solid px-3 text-[13px] font-medium text-solid-ink transition-colors hover:bg-solid-hover"
              >
                <StylusNote className="size-4" />
                New
              </button>
            )}
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          {section === "reminders" ? (
            // not built yet: the illustration, a word on what's coming, and the button that will add one
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 pb-10 text-center">
              <ComingSoonArt className="size-48 text-foreground" />
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-medium">Reminders are coming soon</h2>
                <p className="max-w-sm text-sm text-muted-foreground">A note that comes back to you at the time you choose.</p>
              </div>
              <button
                type="button"
                onClick={() => toast("Reminders are on their way.")}
                className={cn(BOX, "h-9 cursor-pointer gap-1.5 px-3.5 font-medium transition-colors hover:bg-muted")}
              >
                <CirclePlus className="size-4" />
                Add reminder
              </button>
            </div>
          ) : page ? (
            // an open note, or the blank page an add opens (for now)
            open && <NotePage note={open} onChange={(patch) => editNote(open.id, patch)} onBack={() => setPage(null)} />
          ) : loadFailed ? (
            // a failed read knows nothing about your notes, so it never says there are none
            <p className="pt-16 text-center text-sm text-foreground/45">
              Couldn&rsquo;t reach your notes. Nothing you wrote is gone.
            </p>
          ) : !hydrated || !blocksReady || (categoryId && !categories.hydrated) ? (
            <div className="min-h-0 flex-1 overflow-hidden px-3 pt-3">
              <NoteCardsSkeleton />
            </div>
          ) : shared ? (
            // Shared: a blank page for now
            <div className="flex-1" />
          ) : category ? (
            // one category: its icon, name and counts, then its tasks and its notes
            <CategoryPage
              category={category}
              parent={parent}
              ids={[...inCategoryIds]}
              notes={inCategory}
              query={query}
              onOpen={(n) => setPage({ noteId: n.id })}
              onAdd={canWrite ? () => addToCategory(category.id) : undefined}
              onBack={() => {
                setTab("all");
                navigate({ keep: null });
              }}
            />
          ) : tab === "trash" ? (
            <TrashView notes={trashed} ready={trashReady} onRestore={restoreNotes} onDelete={deleteForever} />
          ) : tab === "recent" && recent == null ? (
            // couldn't read today's opens: that's not the same as having opened nothing
            <p className="px-5 pt-10 text-sm text-muted-foreground">Couldn&rsquo;t reach what you opened today. Your notes are all still here.</p>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col px-3 pt-3">
              <CardsView
                notes={shown}
                search={query}
                sort={tab === "recent" ? (a, b) => opened[b.id] - opened[a.id] : undefined}
                onOpen={(n) => setPage({ noteId: n.id })}
                onAdd={canWrite && (tab === "all" || tab === "blocks") ? add : undefined}
                empty={
                  tab === "favorite"
                    ? "Nothing pinned yet. Pin a note and it shows here."
                    : tab === "recent"
                      ? "Nothing opened yet today. Notes you open show here until midnight."
                      : "No notes yet. Anything you write lands here."
                }
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
