"use client";

// Placeholders shaped like the notes views, shown while notes and blocks load — never a blank page.

// one block card: a name, a line, a few rows
function BlockCardSkeleton({ rows }) {
  return (
    <div className="flex min-h-72 flex-col gap-3 rounded-2xl bg-foreground/4 p-4">
      <div className="flex items-center justify-between">
        <span className="h-8 w-24 rounded-lg bg-foreground/8" />
        <span className="size-8 rounded-full bg-foreground/8" />
      </div>
      <span className="h-3 w-32 rounded bg-foreground/6" />
      {Array.from({ length: rows }, (_, i) => (
        <span key={i} className="h-11 rounded-lg bg-foreground/6" />
      ))}
    </div>
  );
}

export function BlockCardsSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-4 p-2 sm:grid-cols-2 xl:grid-cols-3">
      {[2, 1, 0, 1, 0, 2].map((rows, i) => (
        <BlockCardSkeleton key={i} rows={rows} />
      ))}
    </div>
  );
}

export function NoteCardsSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <span className="h-10 w-full rounded-xl bg-foreground/6 sm:max-w-xs" />
        <span className="h-10 w-80 max-w-full rounded-xl bg-foreground/5" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex min-h-56 flex-col gap-3 rounded-2xl bg-foreground/4 p-5">
            <span className="h-4 w-36 rounded bg-foreground/8" />
            <span className="h-5 w-2/3 rounded bg-foreground/8" />
            <span className="h-3 w-full rounded bg-foreground/6" />
            <span className="h-3 w-5/6 rounded bg-foreground/6" />
          </div>
        ))}
      </div>
    </div>
  );
}

// the stack in a notes sheet
export function NoteRowsSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-2.5 px-5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-16 rounded-xl bg-foreground/5" />
      ))}
    </div>
  );
}

// the whole Notes page, for the route to show while it loads
export function NotesPageSkeleton() {
  return (
    <div className="flex h-full flex-col px-6 pt-5 lg:px-8">
      <h1 className="shrink-0 pb-4 text-2xl">Notes</h1>
      <div className="flex shrink-0 animate-pulse items-center justify-between gap-3 pb-4">
        <span className="h-6 w-36 rounded bg-foreground/8" />
        <span className="h-10 w-48 rounded-xl bg-foreground/8" />
      </div>
      <BlockCardsSkeleton />
    </div>
  );
}

// one block's page, for the route to show while it loads
export function BlockPageSkeleton() {
  return (
    <div className="flex h-full flex-col px-6 pt-5 lg:px-8">
      <span className="h-5 w-16 pb-3" />
      <div className="flex shrink-0 animate-pulse items-center justify-between gap-3 pt-3 pb-4">
        <span className="h-10 w-32 rounded-lg bg-foreground/8" />
        <span className="h-10 w-28 rounded-xl bg-foreground/8" />
      </div>
      <NoteCardsSkeleton />
    </div>
  );
}
