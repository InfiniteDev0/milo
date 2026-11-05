"use client";

/* Everything the search can find, gathered while its panel is open:

     pages         the places in Milo (Tasks view, Blocks view, Notes, Journal…)
     blocks        your Life Blocks, archived ones too
     block tasks   by name, reason, note and subtasks
     day tasks     the Tasks view's, by title, note and subtasks — opened on their day
     notes         by title and every word in them, with their block or category
     categories    and subcategories
     journal       every page of every journal, by everything written on it
     voice notes   by the page and journal they sit in

   Blocks, tasks, notes and categories come from the providers already loaded.
   Day tasks and the journal are read fresh each time it opens; a part that
   can't be read is named in `failed`, so the panel never passes off "couldn't
   look" as "nothing there". Each entry knows how to open itself. */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listDayTasks } from "@/lib/db/day-tasks";
import { listAllPages, listJournals, listVoiceMeta } from "@/lib/db/journals";
import { jumpToDayLater } from "@/lib/jump-to-day";
import { VIEW } from "@/lib/view";
import { useBlocks } from "../blocks-provider";
import { useCategories } from "../categories-provider";
import { useNotes } from "../notes-provider";
import { pageLabel } from "../journal/pages";
import { searchable } from "./match";

// what each tab looks in
export const SCOPES = [
  { id: "all", label: "All" },
  { id: "tasks", label: "Tasks", kinds: ["task", "dayTask"] },
  { id: "notes", label: "Notes", kinds: ["note"] },
  { id: "categories", label: "Categories", kinds: ["category", "subcategory"] },
  { id: "journal", label: "Journal", kinds: ["entry", "voice"] },
  { id: "blocks", label: "Blocks", kinds: ["block"] },
  { id: "pages", label: "Pages", kinds: ["nav"] },
];

export const KIND_LABELS = {
  nav: "Go to",
  block: "Blocks",
  task: "Block tasks",
  dayTask: "Day tasks",
  note: "Notes",
  category: "Categories",
  subcategory: "Subcategories",
  entry: "Journal pages",
  voice: "Voice notes",
  day: "On that day",
  create: "Create",
};

const DAY = { weekday: "short", month: "short", day: "numeric" };
const seconds = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export function useSearchEntries(open) {
  const router = useRouter();
  const { blocks, droppedToday, archived, tasks } = useBlocks();
  const { notes } = useNotes();
  const categories = useCategories();
  // read fresh each time the panel opens
  const [fetched, setFetched] = useState({ dayTasks: {}, journals: [], pages: [], voices: [], failed: [] });

  useEffect(() => {
    if (!open) return;
    let alive = true;
    Promise.allSettled([listDayTasks(), listJournals(), listAllPages(), listVoiceMeta()]).then(([d, j, p, v]) => {
      if (!alive) return;
      const failed = [];
      if (d.status === "rejected") failed.push("day tasks");
      if (j.status === "rejected" || p.status === "rejected") failed.push("journal");
      if (v.status === "rejected") failed.push("voice notes");
      setFetched({
        dayTasks: d.value ?? {},
        journals: j.value ?? [],
        pages: p.value ?? [],
        voices: v.value ?? [],
        failed,
      });
    });
    return () => {
      alive = false;
    };
  }, [open]);

  const entries = useMemo(() => {
    if (!open) return [];
    const go = (href) => () => router.push(href);
    const openBlock = (id) => () => window.dispatchEvent(new CustomEvent("milo:open-block", { detail: id }));
    const allBlocks = [...blocks, ...droppedToday, ...archived];
    const blockOf = new Map(allBlocks.map((b) => [b.id, b]));
    const categoryOf = new Map(categories.list.map((c) => [c.id, c]));
    const journalOf = new Map(fetched.journals.map((j) => [j.id, j]));
    const pageOf = new Map(fetched.pages.map((p) => [p.id, p]));
    const list = [];
    const add = (e) => list.push({ date: 0, ...e, match: searchable(e.title, e.rest ?? []) });

    // the places themselves
    const view = (v) => () => {
      VIEW.set(v);
      router.push("/daily");
    };
    for (const [title, run, rest] of [
      ["Tasks view", view("tasks"), ["home today days"]],
      ["Blocks view", view("blocks"), ["home today life blocks"]],
      ["Notes", go("/notes"), []],
      ["Shared notes", go("/notes?shared"), []],
      ["Journal", go("/journal"), ["journals diary entries"]],
      // Calendar, Your month, Your year, Leaderboard, Profile and Settings are left out for now
      // (5 Nov): the onboarding is being redone around the new layout first
    ]) {
      add({ key: `nav:${title}`, kind: "nav", title, rest, run });
    }

    for (const b of allBlocks) {
      add({
        key: `block:${b.id}`,
        kind: "block",
        title: b.name.replace(" Block", ""),
        detail: b.archived ? "Archived" : undefined,
        colour: b.bg,
        rest: ["block"],
        run: openBlock(b.id),
      });
    }

    for (const t of tasks) {
      const block = blockOf.get(t.blockId);
      const steps = t.steps ?? [];
      add({
        key: `task:${t.id}`,
        kind: "task",
        title: t.name,
        detail: steps.length ? `${steps.filter((s) => s.done).length}/${steps.length} subtasks` : t.reason || undefined,
        pill: block && { label: block.name.replace(" Block", ""), colour: block.bg, ink: block.ink },
        rest: [t.reason, t.note, ...steps.map((s) => s.name), block?.name],
        text: [t.reason, t.note, ...steps.map((s) => s.name)].filter(Boolean).join(" · "),
        run: openBlock(t.blockId),
      });
    }

    for (const [key, list] of Object.entries(fetched.dayTasks)) {
      const day = new Date(key);
      for (const t of list) {
        const steps = t.steps ?? [];
        // its label, a category: shown, and searchable by name
        const label = t.categoryId ? categoryOf.get(t.categoryId) : null;
        add({
          key: `day:${t.id}`,
          pill: label ? { label: label.name || "Untitled" } : undefined,
          kind: "dayTask",
          title: t.title || "Untitled task",
          detail: day.toLocaleDateString([], DAY) + (steps.length ? ` · ${steps.filter((s) => s.done).length}/${steps.length} subtasks` : ""),
          done: t.done,
          date: day.getTime(),
          rest: [t.note, ...steps.map((s) => s.name), label?.name, day.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })],
          text: [t.note, ...steps.map((s) => s.name)].filter(Boolean).join(" · "),
          run: () => {
            VIEW.set("tasks");
            jumpToDayLater(day);
            router.push("/daily");
          },
        });
      }
    }

    for (const n of notes) {
      const block = blockOf.get(n.blockId);
      const category = categoryOf.get(n.categoryId);
      const home = category ?? block;
      add({
        key: `note:${n.id}`,
        kind: "note",
        title: n.title?.trim() || "Untitled",
        detail: n.text?.slice(0, 90) || undefined,
        pill: home ? { label: (home.name ?? "").replace(" Block", "") || "Untitled", colour: block && !category ? block.bg : undefined, ink: block?.ink } : { label: "Day note" },
        date: n.updatedAt ?? n.createdAt,
        rest: [n.text, block?.name, category?.name],
        text: n.text,
        run: go(`/notes?note=${n.id}`),
      });
    }

    for (const c of categories.list) {
      const parent = c.parentId ? categoryOf.get(c.parentId) : null;
      add({
        key: `category:${c.id}`,
        kind: parent ? "subcategory" : "category",
        title: c.name || "Untitled",
        detail: parent ? `in ${parent.name || "Untitled"}` : undefined,
        icon: c.icon,
        date: c.editedAt,
        rest: [parent?.name, parent ? "subcategory" : "category"],
        run: go(`/notes?category=${c.id}`),
      });
    }

    for (const p of fetched.pages) {
      const journal = journalOf.get(p.journalId);
      const label = pageLabel(p);
      const d = p.data ?? {};
      const words = [p.body, ...(d.priorities ?? []), ...(d.todos ?? []).map((t) => t.text), ...Object.values(d.hours ?? {}), ...(d.lines ?? [])];
      // a blank page has nothing to find
      if (!words.some((w) => typeof w === "string" && w.trim())) continue;
      const plain = words.filter((w) => typeof w === "string").join(" ").replace(/<[^>]*>/g, " ");
      add({
        key: `entry:${p.id}`,
        kind: "entry",
        title: label || "Journal page",
        detail: plain.replace(/\s+/g, " ").trim().slice(0, 90),
        pill: journal && { label: journal.title || "Journal" },
        date: p.updatedAt,
        rest: [plain, journal?.title],
        text: plain.replace(/s+/g, " "),
        run: go(`/journal?journal=${p.journalId}&page=${p.id}`),
      });
    }

    for (const v of fetched.voices) {
      const page = pageOf.get(v.pageId);
      const journal = page && journalOf.get(page.journalId);
      add({
        key: `voice:${v.id}`,
        kind: "voice",
        title: `Voice note${page ? ` · ${pageLabel(page) || "Journal page"}` : ""}`,
        detail: v.seconds ? seconds(v.seconds) : undefined,
        pill: journal && { label: journal.title || "Journal" },
        date: v.createdAt,
        rest: ["voice recording audio", journal?.title],
        run: page ? go(`/journal?journal=${page.journalId}&page=${page.id}`) : go("/journal"),
      });
    }

    return list;
  }, [open, router, blocks, droppedToday, archived, tasks, notes, categories.list, fetched]);

  return { entries, failed: fetched.failed };
}
