// Where a search turns up in a note: how many times, and the lines around each hit — like an editor's search panel.

// how much text sits either side of a hit
const AROUND = 36;

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// the words exactly as typed, any case
export function searchPattern(query) {
  const q = (query ?? "").trim();
  return q ? new RegExp(escape(q), "gi") : null;
}

// text as plain and matched pieces, ready for <mark>
export function splitByMatch(text, pattern) {
  const parts = [];
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), hit: false });
    parts.push({ text: m[0], hit: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), hit: false });
  return parts;
}

// null when the note has no hit; otherwise the count and up to `maxLines` lines
export function findInNote(note, query, maxLines = 3) {
  const pattern = searchPattern(query);
  if (!pattern) return null;

  const text = note.text ?? "";
  const inTitle = [...(note.title ?? "").matchAll(pattern)].length;
  const hits = [...text.matchAll(pattern)].map((m) => [m.index, m.index + m[0].length]);
  const count = inTitle + hits.length;
  if (count === 0) return null;

  // hits close together share one line
  const windows = [];
  for (const [start, end] of hits) {
    const from = Math.max(0, start - AROUND);
    const to = Math.min(text.length, end + AROUND);
    const prev = windows.at(-1);
    if (prev && from <= prev[1]) prev[1] = to;
    else windows.push([from, to]);
  }

  const lines = windows.slice(0, maxLines).map(([from, to]) => {
    const parts = splitByMatch(text.slice(from, to), pattern);
    const first = parts[0];
    const last = parts.at(-1);
    // never open or close a line on half a word
    if (from > 0 && !first.hit) first.text = first.text.replace(/^\S*\s+/, "");
    if (to < text.length && !last.hit) last.text = last.text.replace(/\s+\S*$/, "");
    return { parts, cutStart: from > 0, cutEnd: to < text.length };
  });

  return { count, lines, more: Math.max(0, windows.length - maxLines) };
}

// true when there is no search, or the search turns up somewhere in the note
export const matchesSearch = (note, query) =>
  !(query ?? "").trim() || findInNote(note, query, 0) != null;

// "5 matches in 2 notes", as numbers
export function summarise(notes, query) {
  let hits = 0;
  let found = 0;
  for (const n of notes) {
    const f = findInNote(n, query, 0);
    if (f) {
      hits += f.count;
      found += 1;
    }
  }
  return { hits, notes: found };
}
