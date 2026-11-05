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
   deleted notes until they're restored or deleted for good. */

import { useState } from "react";
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
import { ComingSoonArt } from "../icons/coming-soon-art";
import { useCategories } from "../categories-provider";
import { TrashView } from "./trash-view";
import { CategoryTasks } from "./category-tasks";
import { IconPicker, PickedIcon } from "../icon-picker";


export function NotesView() {
  const { notes, trashed, trashReady, opened, hydrated, loadFailed, canWrite, editNote, addNote, restoreNotes, deleteForever } = useNotes();
  // the cards need blocks as well as notes, or the page draws once as one Day notes card
  const { blocks, droppedToday, archived, hydrated: blocksReady } = useBlocks();
  // notes or reminders (the bottom tabs), and the block picked in the tree (null: every note)
  const [section, setSection] = useState("notes");
  const [place, setPlace] = useState(null);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
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
  const here = notes.filter(inPlace);
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
  const inCategory = notes.filter((n) => inCategoryIds.has(n.categoryId));
  const shown = tab === "favorite" ? favorites : tab === "recent" ? (recent ?? []) : here;

  // a New from a picked block is for that block
  const add = () => setPage({ blockId: tab === "blocks" && place && place !== "day" ? place : null });

  return (
    <div className="flex h-full min-h-0">
      {/* an open note takes the whole page, so the side section steps aside */}
      {!open && (
        <SidePanel
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
          onPlace={(p) => {
            setPlace(p);
            if (page) setPage(null);
          }}
          categories={categories}
          category={category?.id ?? null}
          onCategory={setCategory}
          onCategoryAdd={canWrite ? addToCategory : undefined}
          onOpenNote={(n, id) => navigate({ noteId: n.id, keep: id })}
          shared={shared}
          onShared={() => navigate({ shared: true, keep: null })}
        />
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        {/* an open note takes the whole page: no tabs over it (it has its own back arrow) */}
        {/* tabs along the top, as the reference has them, and New at the end */}
        {/* one line for everything: the tabs fill the bar's height with their underline on its edge,
            and the boxes sit centred on the same line */}
        {!open && (
          <div className="flex h-11 shrink-0 items-center gap-5 border-b border-border px-5">
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
                onClick={() => {
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
            {canWrite && (
              <button
                type="button"
                onClick={add}
                className={cn(BOX, "ms-auto cursor-pointer gap-1.5 font-medium transition-colors hover:bg-muted")}
              >
                <CirclePlus className="size-3.5" />
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
            // one category: its name, how many notes are in it (its subcategories' too), then the notes
            <>
              <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-5 text-sm">
                {/* the icon: click it to change it, as the reference does */}
                <IconPicker value={category.icon} onChange={(icon) => categories.setIcon(category.id, icon)}>
                  <button
                    type="button"
                    aria-label="Change icon"
                    className="-ms-1 flex size-7 cursor-pointer items-center justify-center rounded-sm transition-colors hover:bg-foreground/10 data-popup-open:bg-foreground/10"
                  >
                    <PickedIcon icon={category.icon} size={16} />
                  </button>
                </IconPicker>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {parent && <span className="font-normal text-muted-foreground">{parent.name || "Untitled"} / </span>}
                  {category.name || "Untitled"}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {inCategory.length} {inCategory.length === 1 ? "note" : "notes"}
                </span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col px-3 pt-3">
                {/* the tasks labelled with it, then its notes */}
                <CategoryTasks ids={[...inCategoryIds]} />
                <CardsView
                  notes={inCategory}
                  search={query}
                  onOpen={(n) => setPage({ noteId: n.id })}
                  onAdd={canWrite ? () => addToCategory(category.id) : undefined}
                  addLabel={`Add a note to ${category.name || "Untitled"}`}
                  empty={`Nothing in ${category.name || "Untitled"} yet.`}
                />
              </div>
            </>
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
