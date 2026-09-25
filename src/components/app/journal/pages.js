// What a journal page is, what it's called in the contents, and where each page sits in the book.

import { dateOf, stampOf } from "@/lib/stamp";

export const ENTRY_NAMES = { morning: "Morning Entry", pause: "Pause Entry", night: "Night Entry" };

export const monthStamp = (d) => `${d.getFullYear()}-${d.getMonth() + 1}`;
export const yearStamp = (d) => `${d.getFullYear()}`;

export function newPage(journalId, position, fields = {}) {
  return {
    id: crypto.randomUUID(),
    journalId,
    position,
    kind: "write",
    stamp: null,
    entry: null,
    heads: false,
    body: "",
    data: {},
    notes: [],
    blocks: [],
    bookmarked: false,
    createdAt: Date.now(),
    ...fields,
  };
}

// the day, month or year a page is about; a writing page is about the day it was started
export function pageDate(page) {
  if (!page.stamp) return new Date(page.createdAt);
  const parts = page.stamp.split("-").map(Number);
  if (parts.length === 3) return dateOf(page.stamp);
  return new Date(parts[0], (parts[1] ?? 1) - 1, 1);
}

// only the start of something is listed; a continued page or a plan's second half is not
export const listed = (p) => p.heads || p.kind === "day-schedule" || p.kind === "month" || p.kind === "vision";

export function pageLabel(p) {
  if (p.kind === "day-schedule" || p.kind === "day-plan") return "Day plan";
  if (p.kind === "month") return `${pageDate(p).toLocaleDateString(undefined, { month: "long" })} plan`;
  if (p.kind === "vision") return `${p.stamp} vision`;
  return p.entry ? ENTRY_NAMES[p.entry] : "Page";
}

export const shortDate = (d) => d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

// has something on it; an empty last page doesn't earn a fresh spread after it
export const hasContent = (p) => p != null && (p.kind !== "write" || p.body.trim() !== "");

export const isPinned = (p) => p.notes.length > 0 || p.blocks.length > 0;

// Pages laid into the book's slots. A day plan is a spread, so it always starts on a left page;
// when it would land on a right one, a blank page (null) sits before it, like a real planner.
export function layOut(pages) {
  const slots = [];
  for (const p of pages) {
    if (p.kind === "day-schedule" && slots.length % 2 === 1) slots.push(null);
    slots.push(p);
  }
  return slots;
}

// everything a search can find on a page
export function pageText(p) {
  const d = p.data ?? {};
  return [
    pageLabel(p),
    p.body,
    ...(d.priorities ?? []),
    ...(d.todos ?? []).map((t) => t.text),
    ...Object.values(d.hours ?? {}),
    ...(d.lines ?? []),
  ]
    .filter(Boolean)
    .join(" \n ");
}

// a few words either side of the first match
export function snippet(text, query) {
  const at = text.toLowerCase().indexOf(query.toLowerCase());
  if (at < 0) return "";
  const from = Math.max(0, at - 30);
  return `${from > 0 ? "…" : ""}${text.slice(from, at + query.length + 50).replace(/\s+/g, " ").trim()}…`;
}

export const todayStamp = () => stampOf(new Date());
