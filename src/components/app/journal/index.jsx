"use client";

// The journal page: your journals as books on a shelf. Open one to write, plan, pin and look back.

import { useCallback, useState } from "react";
import { Search } from "lucide-react";
import { AddJournalCard } from "./add-journal-card";
import { BookCard } from "./book-card";
import { JournalHero } from "./journal-hero";
import { OpenBook } from "./open-book";
import { useJournals } from "./use-journals";

export function JournalShelf() {
  const [query, setQuery] = useState("");
  const [readingId, setReadingId] = useState(null);
  const { journals, userId, hydrated, loadFailed, canWrite, createJournal, updateJournal } = useJournals();
  const reading = journals.find((j) => j.id === readingId) ?? null;
  const shown = journals.filter((j) => j.title.toLowerCase().includes(query.trim().toLowerCase()));

  // stable, so the Esc listener isn't re-added every time this page re-renders
  const close = useCallback(() => setReadingId(null), []);

  const start = () => {
    const made = createJournal();
    if (made) setReadingId(made.id);
  };

  return (
    // the open book covers this whole pane, not just the part scrolled into view
    <div className="relative h-full">
      <div
        className="flex h-full flex-col overflow-y-auto"
        // two tones, like light falling across a desk
        style={{
          background:
            "linear-gradient(90deg, var(--card) 0 38%, color-mix(in oklab, var(--foreground) 5%, var(--card)) 38% 100%)",
        }}
      >
        <div className="relative flex min-h-full flex-col gap-8 px-6 pt-5 pb-6 sm:px-10">
          <label className="flex h-10 w-full max-w-sm items-center gap-2.5 text-foreground/50">
            <Search className="size-4 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your journals…"
              aria-label="Search your journals"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
            />
          </label>

          {/* on wide screens the two columns follow the two-tone background: words on the left, books on the right */}
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,34%)_1fr]">
            <JournalHero
              hasBooks={journals.length > 0}
              disabled={!canWrite}
              // back into the newest journal, or the first one made for you
              onOpen={() => (journals.length > 0 ? setReadingId(journals.at(-1).id) : start())}
            />

            {/* below the hanging shelf and in from the split; -ml-12 cancels the card padding on narrow screens */}
            <div className="-ml-12 flex flex-wrap items-stretch gap-6 lg:ml-0 lg:pt-32 lg:pl-16">
              {loadFailed ? (
                // a failed read knows nothing about your journals, so it never says there are none
                <p className="ml-12 max-w-xs text-sm text-foreground/50 lg:ml-0">
                  Couldn&rsquo;t reach your journals. Nothing you wrote is gone.
                </p>
              ) : !hydrated ? (
                <div className="ml-12 aspect-[1414/2000] w-44 animate-pulse rounded-[3px_10px_10px_3px] bg-foreground/5 lg:ml-0" />
              ) : (
                <>
                  {shown.map((j) => (
                    <BookCard
                      key={j.id}
                      journal={j}
                      open={readingId === j.id}
                      onChange={(patch) => updateJournal(j.id, patch)}
                      onOpen={() => setReadingId(j.id)}
                    />
                  ))}
                  {canWrite && <AddJournalCard onAdd={start} first={journals.length === 0} />}
                </>
              )}
            </div>
          </div>

          {/* the shelf hangs from the top-right corner, turned over so the hand reaches down from above;
              wide screens only, where it can't sit over the heading */}
          <img
            src="/journal.png"
            alt=""
            width={1341}
            height={446}
            className="pointer-events-none absolute top-0 right-0 hidden h-auto w-[min(30rem,45%)] rotate-180 select-none lg:block"
            draggable={false}
          />
        </div>
      </div>

      <OpenBook journal={reading} userId={userId} onClose={close} />
    </div>
  );
}
