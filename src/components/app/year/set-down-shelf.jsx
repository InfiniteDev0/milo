"use client";

// Wishes you set down for this year. Quiet and folded away, never counted, and one press brings any of them back.

export function SetDownShelf({ vision }) {
  const { wishes, updateWish } = vision;
  const resting = wishes.filter((w) => w.status === "set-down");
  if (resting.length === 0) return null;

  return (
    <details className="group rounded-2xl bg-foreground/4 px-5 py-3">
      <summary className="cursor-pointer text-sm text-foreground/55 marker:text-foreground/30">
        Set down for now · {resting.length}
      </summary>
      <p className="pt-2 text-xs text-foreground/45">Things you decided weren’t for this year. Nothing is lost.</p>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0 pt-3">
        {resting.map((w) => (
          <li key={w.id} className="flex items-center justify-between gap-3 rounded-lg bg-card px-3 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate">{w.text}</span>
            <button
              type="button"
              onClick={() => updateWish(w.id, { status: "open" })}
              className="shrink-0 cursor-pointer rounded-md px-2 py-1 text-xs text-foreground/55 ring-1 ring-foreground/10 transition-colors hover:text-foreground"
            >
              Pick it back up
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
