"use client";

// The journal page. UI first — built step by step as it's designed.

import { useCallback, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { AddJournalCard } from "./add-journal-card";
import { BookCard } from "./book-card";
import { JournalHero } from "./journal-hero";
import { OpenBook } from "./open-book";
import { useBookPages } from "./use-book-pages";

// said honestly while the page is still a design
const comingNext = (what) =>
  toast(`${what} is the next thing we build.`, { id: "milo-journal-next", duration: 2500 });

export function JournalShelf() {
  const [query, setQuery] = useState("");
  const [reading, setReading] = useState(false);
  // no journal books exist yet; this becomes real once journals are wired up
  const hasBooks = false;
  // what's written stays while you're on this page, even with the book closed
  const book = useBookPages();

  // stable, so the Esc listener isn't re-added every time this page re-renders
  const close = useCallback(() => setReading(false), []);

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
              hasBooks={hasBooks}
              onOpen={() => comingNext(hasBooks ? "Reading your journal" : "Writing your first entry")}
            />

            {/* below the hanging shelf and in from the split; -ml-12 cancels the card padding on narrow screens */}
            <div className="-ml-12 flex flex-wrap items-stretch gap-6 lg:ml-0 lg:pt-32 lg:pl-16">
              <BookCard open={reading} onOpen={() => setReading(true)} onMenu={() => comingNext("The book menu")} />
              <AddJournalCard onAdd={() => comingNext("Starting a new journal")} />
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

      <OpenBook open={reading} onClose={close} book={book} />
    </div>
  );
}
