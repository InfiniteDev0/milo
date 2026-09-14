"use client";

// Search results the way an editor shows them: the words marked, a count, and the lines they sit in.

import { searchPattern, splitByMatch } from "@/lib/note-search";

const MARK = "rounded-[3px] bg-[#ffd600]/50 px-px text-inherit";

function Marked({ parts }) {
  return parts.map((p, i) =>
    p.hit ? (
      <mark key={i} className={MARK}>
        {p.text}
      </mark>
    ) : (
      <span key={i}>{p.text}</span>
    ),
  );
}

// any text with the search marked in it; plain text when there is no search
export function Highlight({ text, query }) {
  const pattern = searchPattern(query);
  if (!pattern || !text) return text;
  return <Marked parts={splitByMatch(text, pattern)} />;
}

// the lines a note's hits sit in
export function MatchLines({ found, className = "" }) {
  if (!found || found.lines.length === 0) return null;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {found.lines.map((line, i) => (
        <p key={i} className="break-words text-xs leading-relaxed text-foreground/55">
          {line.cutStart && "… "}
          <Marked parts={line.parts} />
          {line.cutEnd && " …"}
        </p>
      ))}
      {found.more > 0 && (
        <span className="text-[11px] text-foreground/35">and {found.more} more</span>
      )}
    </div>
  );
}

// how many times the search turns up in one note
export function MatchCount({ count }) {
  return (
    <span
      title={`${count} ${count === 1 ? "match" : "matches"}`}
      className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-foreground/10 px-1.5 text-[11px] tabular-nums text-foreground/70"
    >
      {count}
    </span>
  );
}

// "5 matches in 2 notes"
export function MatchSummary({ hits, notes }) {
  return (
    <span className="tabular-nums">
      {hits} {hits === 1 ? "match" : "matches"} in {notes} {notes === 1 ? "note" : "notes"}
    </span>
  );
}
