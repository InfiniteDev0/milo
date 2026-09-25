"use client";

// One journal book. The book is always there; on hover only the card's colour fades in, with its ⋯ menu.
// Opening it swings the cover back in 3D as the book grows, like BookPreview; closing swings it shut again.

import { motion } from "motion/react";
import { CoverMenu } from "./cover-menu";
import { JournalCover } from "./journal-cover";
import { COVER, PAPER } from "./paper";

// the spine: a darker fold on the left and a thin highlight, so a flat cover reads as a bound book
const SPINE =
  "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.08) 2.5%, rgba(255,255,255,0.16) 3.5%, rgba(255,255,255,0) 7%)";

const HIDE_BACK = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
const EASE = [0.4, 0, 0.2, 1];

export function BookCard({ journal, open, onChange, onOpen }) {
  const cover = journal.cover;
  return (
    // p-12 leaves the ⋯ its own corner of the card, clear of the book; a click anywhere on the card opens it
    <div
      onClick={onOpen}
      className="group relative w-fit cursor-pointer rounded-3xl p-12 transition-all duration-500 ease-out hover:bg-foreground/5"
    >
      {/* the menu is its own thing; a click in it doesn't open the book */}
      <div onClick={(e) => e.stopPropagation()}>
        <CoverMenu
          cover={cover}
          onCover={(c) => onChange({ cover: c })}
          title={journal.title}
          onTitle={(t) => onChange({ title: t })}
        />
      </div>

      {/* the book itself is the button, so the keyboard can open it too */}
      <button
        type="button"
        aria-label={`Open ${journal.title}`}
        className="relative block aspect-[1414/2000] w-44 cursor-pointer"
        style={{ perspective: "1800px" }}
      >
        <motion.span
          className={`absolute inset-0 block ${open ? "z-10" : ""}`}
          style={{ transformStyle: "preserve-3d", transformOrigin: "0% 50%" }}
          animate={{ scale: open ? 1.4 : 1 }}
          transition={{ duration: 0.42, delay: open ? 0 : 0.08, ease: EASE }}
        >
          {/* the first page, showing once the cover swings away */}
          <span
            className="absolute inset-0 block rounded-[3px_10px_10px_3px] shadow-[0_16px_28px_-12px_rgba(0,0,0,0.55)]"
            style={{ background: PAPER, border: `3px solid ${COVER}`, borderLeft: "none" }}
          />

          <motion.span
            className="absolute inset-0 block"
            style={{ transformStyle: "preserve-3d", transformOrigin: "0% 50%" }}
            animate={{ rotateY: open ? -180 : 0 }}
            transition={{ duration: 0.28, delay: open ? 0 : 0.22, ease: EASE }}
          >
            <span className="absolute inset-0 block overflow-hidden rounded-[3px_10px_10px_3px]" style={HIDE_BACK}>
              <JournalCover cover={cover} />
              <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: SPINE }} />
            </span>
            {/* the inside of the cover */}
            <span
              className="absolute inset-0 block rounded-[10px_3px_3px_10px]"
              style={{ ...HIDE_BACK, transform: "rotateY(180deg)", background: PAPER, border: `3px solid ${COVER}`, borderRight: "none" }}
            />
          </motion.span>
        </motion.span>
      </button>

      <p className="mt-4 w-44 truncate text-center text-sm text-foreground/70">{journal.title}</p>
    </div>
  );
}
