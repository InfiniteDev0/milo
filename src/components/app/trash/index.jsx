"use client";

/* Trash: everything you deleted, in one place — notes, tasks (from blocks and
   from days), blocks, and journal pages. Each can go back where it was, or be
   deleted for good with a few seconds of Undo; Empty Trash does that to all.
   Nothing leaves Trash on its own.

   Notes come from the notes provider (they've had Trash since 0015); the rest
   are read here (migration 0019). Before 0019 those deletes were for good, so
   there's nothing of theirs to show and it says so. A failed read says that
   too, never "Trash is empty". */

import { useEffect, useState } from "react";
import { BookOpen, CalendarCheck, FileText, RotateCcw, SquareCheck, Trash2 } from "lucide-react";
import { deleteForGood, hasTrash, listTrash, restore } from "@/lib/db/trash";
import { writeNow } from "@/lib/db/sync";
import { timeAgo } from "@/lib/time-ago";
import { playTask, playTuck } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { BOX } from "../view-header";
import { useBlocks } from "../blocks-provider";
import { useNotes } from "../notes-provider";
import { showUndoToast } from "../undo-toast";
import { pageLabel } from "../journal/pages";

const dayOf = (date) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
};

function Row({ icon, title, detail, deletedAt, onRestore, onDelete }) {
  return (
    <li className="group flex h-12 items-center gap-3 rounded-sm border border-foreground/10 bg-card px-3.5 transition-colors hover:border-foreground/25">
      {icon}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {detail ? `${detail} · ` : ""}Deleted {timeAgo(deletedAt)}
        </span>
      </div>
      <button type="button" onClick={onRestore} className={cn(BOX, "cursor-pointer gap-1.5 transition-colors hover:bg-muted")}>
        <RotateCcw className="size-3.5" />
        Restore
      </button>
      <button
        type="button"
        onClick={onDelete}
        className={cn(BOX, "cursor-pointer gap-1.5 text-muted-foreground transition-colors hover:bg-[#ef4444]/10 hover:text-[#ef4444]")}
      >
        <Trash2 className="size-3.5" />
        Delete for good
      </button>
    </li>
  );
}

function Section({ title, count, children }) {
  if (!count) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium text-muted-foreground">
        {title} <span className="tabular-nums">{count}</span>
      </h2>
      <ul className="flex flex-col gap-1.5">{children}</ul>
    </section>
  );
}

export function TrashPage() {
  const { trashed: notes, restoreNotes, deleteForever, hydrated: notesReady } = useNotes();
  const { retry: reloadBlocks } = useBlocks();
  // null while it loads, false if it couldn't; { tasks, dayTasks, blocks, pages }
  const [items, setItems] = useState(null);
  const [ready, setReady] = useState(true);

  useEffect(() => {
    let alive = true;
    hasTrash().then((has) => {
      if (!alive) return;
      setReady(has);
      if (!has) return setItems({ tasks: [], dayTasks: [], blocks: [], pages: [] });
      listTrash()
        .then((r) => alive && setItems(r))
        .catch((err) => {
          console.warn("[milo] could not read Trash", err);
          if (alive) setItems(false);
        });
    });
    return () => {
      alive = false;
    };
  }, []);

  // out of the list now; the database changes at once for a restore, after Undo for a for-good delete
  const take = (item) =>
    setItems((all) => all && Object.fromEntries(Object.entries(all).map(([k, list]) => [k, list.filter((x) => !(x.kind === item.kind && x.id === item.id))])));
  const put = (item) => {
    const key = { task: "tasks", dayTask: "dayTasks", block: "blocks", page: "pages" }[item.kind];
    setItems((all) => all && { ...all, [key]: [item, ...all[key]].sort((a, b) => b.deletedAt - a.deletedAt) });
  };

  const back = (item) => {
    take(item);
    writeNow(`trash-restore:${item.kind}:${item.id}`, () => restore(item.kind, item.id));
    playTask();
    // a block or block task comes back onto the board
    if (item.kind === "task" || item.kind === "block") setTimeout(reloadBlocks, 600);
  };
  const forGood = (list) => {
    if (list.length === 0) return;
    list.forEach(take);
    playTuck();
    const one = list.length === 1;
    showUndoToast({
      title: one ? `Deleted “${list[0].title || "Untitled"}” for good` : `${list.length} things deleted for good`,
      hint: one ? "You can still bring it back." : "You can still bring them back.",
      onCommit: () => list.forEach((x) => writeNow(`trash-delete:${x.kind}:${x.id}`, () => deleteForGood(x.kind, x.id))),
      onUndo: () => {
        playTask();
        list.forEach(put);
      },
    });
  };

  const everything = items ? [...items.tasks, ...items.dayTasks, ...items.blocks, ...items.pages] : [];
  const total = notes.length + everything.length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-border px-5">
        <h1 className="text-sm font-semibold">Trash</h1>
        <span className="flex-1 text-sm text-muted-foreground">{total > 0 && "Everything you deleted stays here until you delete it for good."}</span>
        {total > 0 && (
          <button
            type="button"
            onClick={() => {
              if (notes.length) deleteForever(notes.map((n) => n.id));
              forGood(everything);
            }}
            className={cn(BOX, "cursor-pointer gap-1.5 text-[#ef4444] transition-colors hover:bg-[#ef4444]/10")}
          >
            <Trash2 className="size-3.5" />
            Empty Trash
          </button>
        )}
      </div>

      <div className="scrollbar-pill min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {items === false ? (
          <p className="text-sm text-muted-foreground">Couldn&rsquo;t reach your Trash. Nothing in it is lost.</p>
        ) : items === null || !notesReady ? (
          <div className="flex flex-col gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-12 animate-pulse rounded-sm bg-foreground/5" />
            ))}
          </div>
        ) : total === 0 ? (
          <p className="text-sm text-muted-foreground">
            Trash is empty. Anything you delete — notes, tasks, blocks, journal pages — waits here until you delete it for good.
          </p>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {!ready && (
              <p className="text-xs text-muted-foreground">Tasks, blocks and journal pages join Trash once migration 0019 is run. Until then only notes do.</p>
            )}
            <Section title="Notes" count={notes.length}>
              {notes.map((n) => (
                <Row
                  key={n.id}
                  icon={<FileText className="size-4 shrink-0 text-muted-foreground" />}
                  title={n.title?.trim() || "Untitled"}
                  detail="Note"
                  deletedAt={n.deletedAt}
                  onRestore={() => restoreNotes([n.id])}
                  onDelete={() => deleteForever([n.id])}
                />
              ))}
            </Section>
            <Section title="Tasks" count={items.tasks.length + items.dayTasks.length}>
              {items.tasks.map((t) => (
                <Row
                  key={t.id}
                  icon={<SquareCheck className="size-4 shrink-0 text-muted-foreground" />}
                  title={t.title || "Untitled task"}
                  detail={t.block ? t.block.name.replace(" Block", "") : "Block task"}
                  deletedAt={t.deletedAt}
                  onRestore={() => back(t)}
                  onDelete={() => forGood([t])}
                />
              ))}
              {items.dayTasks.map((t) => (
                <Row
                  key={t.id}
                  icon={<CalendarCheck className="size-4 shrink-0 text-muted-foreground" />}
                  title={t.title || "Untitled task"}
                  detail={dayOf(t.day)}
                  deletedAt={t.deletedAt}
                  onRestore={() => back(t)}
                  onDelete={() => forGood([t])}
                />
              ))}
            </Section>
            <Section title="Blocks" count={items.blocks.length}>
              {items.blocks.map((b) => (
                <Row
                  key={b.id}
                  icon={<span className="size-4 shrink-0 rounded-sm" style={{ background: b.bg }} />}
                  title={b.title.replace(" Block", "")}
                  detail="Block, with its tasks"
                  deletedAt={b.deletedAt}
                  onRestore={() => back(b)}
                  onDelete={() => forGood([b])}
                />
              ))}
            </Section>
            <Section title="Journal pages" count={items.pages.length}>
              {items.pages.map((p) => (
                <Row
                  key={p.id}
                  icon={<BookOpen className="size-4 shrink-0 text-muted-foreground" />}
                  title={pageLabel(p.page) || "Page"}
                  detail={p.journal}
                  deletedAt={p.deletedAt}
                  onRestore={() => back(p)}
                  onDelete={() => forGood([{ ...p, title: pageLabel(p.page) }])}
                />
              ))}
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
