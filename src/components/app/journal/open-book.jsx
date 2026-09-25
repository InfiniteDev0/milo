"use client";

// A journal, opened: the book grows in as its cover swings open on the shelf. Search, contents and bookmarks sit on the left,
// month tabs down the book's edge. Esc or Go Back closes it.

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, PanelLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AddPageMenu } from "./add-page-menu";
import { BookSidebar } from "./book-sidebar";
import { BookSpread } from "./book-spread";
import { bookSerif } from "./font";
import { MonthTabs } from "./month-tabs";
import { PAGE_IMAGE } from "./paper";
import { useJournalBook } from "./use-journal-book";

// round page-turn buttons on the book's outer margins, faint until you reach for them
const TURN_BUTTON =
  "absolute top-1/2 z-20 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#dddddd]/70 text-[#333] opacity-40 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100";

export function OpenBook({ journal, userId, onClose }) {
  // fetch the page photos early, so the book never opens blank
  useEffect(() => {
    for (const src of PAGE_IMAGE) new window.Image().src = src;
  }, []);

  // Esc closes
  useEffect(() => {
    if (!journal) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [journal, onClose]);

  return (
    <AnimatePresence>
      {journal && (
        // like BookPreview: the big book waits for the cover to swing open, then fades and grows in; closing is the reverse
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${journal.title}, open`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.22, ease: "easeOut" } }}
          exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.05, ease: "easeIn" } }}
          className="absolute inset-0 z-20 flex flex-col bg-card"
        >
          <Reading key={journal.id} journal={journal} userId={userId} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Reading({ journal, userId, onClose }) {
  const book = useJournalBook(journal, userId);
  // the sidebar is always there on wide screens; on narrow ones it opens over the book
  const [side, setSide] = useState(false);
  const { spread, flip, turn, lastSpread } = book;

  return (
    <>
      <div className="flex shrink-0 items-center gap-3 px-4 pt-4 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 cursor-pointer items-center gap-1 rounded-full bg-foreground/5 pr-4 pl-2.5 text-sm text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Go back
        </button>
        <button
          type="button"
          onClick={() => setSide((v) => !v)}
          aria-label="Contents and search"
          aria-expanded={side}
          className="flex size-9 cursor-pointer items-center justify-center rounded-full text-foreground/60 hover:bg-foreground/5 lg:hidden"
        >
          <PanelLeft className="size-4" />
        </button>
        <span className={`${bookSerif.className} truncate text-lg italic text-foreground/80 lg:hidden`}>{journal.title}</span>
        <div className="ml-auto">
          <AddPageMenu book={book} />
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 gap-6 px-4 pt-3 pb-4 sm:px-6">
        {/* search on the left, where you look first */}
        <aside
          className={`z-30 w-64 shrink-0 bg-card lg:static lg:block ${
            side ? "absolute inset-y-0 left-0 block p-4 shadow-xl lg:p-0 lg:shadow-none" : "hidden"
          }`}
        >
          <BookSidebar
            book={book}
            title={journal.title}
            onJump={(to) => {
              book.jump(to);
              setSide(false);
            }}
          />
        </aside>

        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1, transition: { duration: 0.28, delay: 0.22, ease: "easeOut" } }}
          exit={{ scale: 0.95, transition: { duration: 0.25, ease: "easeIn" } }}
          className="relative min-w-0 flex-1"
        >
          {book.loadFailed ? (
            // a failed read knows nothing about what you wrote, so it never shows an empty book
            <p className="pt-20 text-center text-sm text-foreground/50">
              Couldn&rsquo;t open this journal right now. Nothing you wrote is gone.
            </p>
          ) : !book.loaded ? (
            <p className="pt-20 text-center text-sm text-foreground/40">Opening…</p>
          ) : (
            <BookSpread book={book} gutter="2.5rem">
              {spread > 0 && (
                <button
                  type="button"
                  onClick={() => turn(-1)}
                  disabled={flip !== 0}
                  aria-label="Previous pages"
                  className={`${TURN_BUTTON} left-[calc(4.5%-18px)]`}
                >
                  <ChevronLeft className="size-4" />
                </button>
              )}
              {spread < lastSpread && (
                <button
                  type="button"
                  onClick={() => turn(1)}
                  disabled={flip !== 0}
                  aria-label="Next pages"
                  className={`${TURN_BUTTON} right-[calc(4.5%-18px)]`}
                >
                  <ChevronRight className="size-4" />
                </button>
              )}
              <MonthTabs book={book} />
            </BookSpread>
          )}
        </motion.div>
      </div>
    </>
  );
}
