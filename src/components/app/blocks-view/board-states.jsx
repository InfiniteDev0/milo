"use client";

// What the board shows before it has your blocks: skeleton columns while they
// load, and a plain "couldn't load" with a retry if loading failed. A failed or
// unfinished read must never read as "you have no blocks".

const PULSE = "animate-pulse rounded-lg bg-foreground/[0.06]";

// three columns shaped like the real ones: a box, Add a task, a few cards
export function BoardSkeleton() {
  return [3, 2, 4].map((cards, i) => (
    <div key={i} aria-hidden className="flex w-[18rem] shrink-0 flex-col gap-2.5">
      <div className={`${PULSE} h-16 rounded-xl`} />
      <div className={`${PULSE} h-10`} />
      <div className="flex flex-col gap-2 pt-1">
        {Array.from({ length: cards }, (_, j) => (
          <div key={j} className={`${PULSE} h-[52px]`} />
        ))}
      </div>
    </div>
  ));
}

export function BoardFailed({ onRetry }) {
  return (
    <div className="flex flex-col items-start gap-3 py-6">
      <p className="text-sm text-muted-foreground">Your blocks didn&apos;t load. Nothing is lost — they&apos;re still saved.</p>
      <button
        type="button"
        onClick={onRetry}
        className="h-8 cursor-pointer rounded-sm border border-border px-3 text-[13px] transition-colors hover:bg-muted"
      >
        Try again
      </button>
    </div>
  );
}
