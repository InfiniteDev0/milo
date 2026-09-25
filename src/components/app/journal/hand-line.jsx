"use client";

// One ruled line you write on in the journal's hand. Read-only while its page turns.

import { bookHand } from "./font";
import { INK, LINE } from "./paper";

const LINE_STYLE = {
  height: `${LINE}cqh`,
  lineHeight: `${LINE}cqh`,
  fontSize: `${LINE * 0.8}cqh`,
  color: INK,
  borderColor: "rgba(39, 50, 77, 0.14)",
};

export function HandLine({ value = "", onChange, edit, label, done = false, className = "" }) {
  const look = `${bookHand.className} block w-full min-w-0 flex-1 truncate border-0 border-b bg-transparent p-0 outline-none ${
    done ? "line-through opacity-50" : ""
  } ${className}`;
  if (!edit) return <span className={look} style={LINE_STYLE}>{value || "\u00a0"}</span>;
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      spellCheck={false}
      className={look}
      style={{ ...LINE_STYLE, caretColor: INK }}
    />
  );
}

// a quiet heading band across the page, like a printed planner's
export function Band({ children }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[0.4cqh] font-sans font-medium tracking-[0.25em] uppercase"
      style={{ height: `${LINE}cqh`, fontSize: `${LINE * 0.38}cqh`, background: "rgba(39, 50, 77, 0.07)", color: "rgba(39, 50, 77, 0.7)" }}
    >
      {children}
    </div>
  );
}

// writing space that fills what's left of a planner page
export function HandArea({ value = "", onChange, edit, label }) {
  const style = { lineHeight: `${LINE}cqh`, fontSize: `${LINE * 0.8}cqh`, color: INK };
  const look = `${bookHand.className} min-h-0 w-full flex-1 resize-none overflow-hidden border-0 bg-transparent p-0 whitespace-pre-wrap outline-none`;
  if (!edit) return <div className={look} style={style}>{value}</div>;
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      spellCheck={false}
      className={look}
      style={{ ...style, caretColor: INK }}
    />
  );
}
