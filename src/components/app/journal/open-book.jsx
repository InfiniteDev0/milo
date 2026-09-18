"use client";

// A journal, opened: the book grows in as its cover swings open on the shelf, ready to write in. Esc or Go Back closes it.
// The right side of the pane is kept free for what comes next.

import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BookSpread } from "./book-spread";
import { bookSerif } from "./font";
import { PAGE_IMAGE } from "./paper";
import { Button } from "@/components/ui/button";

// round page-turn buttons on the book's outer margins, faint until you reach for them
const TURN_BUTTON =
  "absolute top-1/2 z-20 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#dddddd]/70 text-[#333] opacity-40 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100";

export function OpenBook({ open, onClose, book }) {
  const { spread, flip, turn, lastSpread } = book;

  // fetch the page photos early, so the book never opens blank
  useEffect(() => {
    for (const src of PAGE_IMAGE) new window.Image().src = src;
  }, []);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        // like BookPreview: the big book waits for the cover to swing open, then fades and grows in; closing is the reverse
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Your journal, open"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.22, ease: "easeOut" } }}
          exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.05, ease: "easeIn" } }}
          className="absolute inset-0 z-20 flex flex-col bg-card"
        >
          <div className="flex shrink-0 items-center gap-3 px-6 pt-4 sm:px-10">
            <Button 
              type="button"
              onClick={onClose}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-full px-3 text-sm text-foreground/70 transition-colors bg-black hover:bg-foreground/5 hover:text-foreground"
            >
             Go Back 
            </Button>
            <span className={`${bookSerif.className} text-lg italic text-foreground/80`}>My Journal</span>
          </div>

          <div className="flex min-h-0 flex-1 gap-6 px-4 pt-3 pb-4 sm:px-6">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1, transition: { duration: 0.28, delay: 0.22, ease: "easeOut" } }}
              exit={{ scale: 0.95, transition: { duration: 0.25, ease: "easeIn" } }}
              className="relative min-w-0 flex-1"
            >
              <BookSpread book={book}>
                {spread > 0 && (
                  <button type="button" onClick={() => turn(-1)} disabled={flip !== 0} aria-label="Previous pages" className={`${TURN_BUTTON} left-[calc(4.5%-18px)]`}>
                    <ChevronLeft className="size-4" />
                  </button>
                )}
                {spread < lastSpread && (
                  <button type="button" onClick={() => turn(1)} disabled={flip !== 0} aria-label="Next pages" className={`${TURN_BUTTON} right-[calc(4.5%-18px)]`}>
                    <ChevronRight className="size-4" />
                  </button>
                )}
              </BookSpread>
            </motion.div>

            {/* kept free on wide screens for what comes next */}
            <aside aria-hidden className="hidden w-[18%] shrink-0 lg:block" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
