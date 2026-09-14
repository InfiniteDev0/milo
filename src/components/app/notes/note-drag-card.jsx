"use client";

// The note under the pointer while it is carried: solid and lifted, stacked with a count when several travel together.

const day = (ms) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export function NoteDragCard({ note, count }) {
  return (
    <div className="relative">
      {count > 1 && (
        <div
          aria-hidden
          className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-lg bg-card ring-1 ring-foreground/10"
        />
      )}

      <div className="relative flex items-center gap-2.5 rounded-lg bg-card px-3 py-2.5 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.22)] ring-1 ring-foreground/10">
        <span className="min-w-0 flex-1 truncate">{note.title?.trim() || "Untitled"}</span>
        {count > 1 ? (
          <span className="shrink-0 rounded-full bg-foreground px-2 py-0.5 text-[11px] text-background tabular-nums">
            {count}
          </span>
        ) : (
          <span className="shrink-0 text-[11px] text-foreground/35 tabular-nums">
            {day(note.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}
