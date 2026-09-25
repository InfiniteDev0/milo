"use client";

// The shelf's opening words: an invitation back into what you've written, never a nudge about what you haven't.

import { ArrowUpRight } from "lucide-react";
import { bookSerif } from "./font";

// with no book on the shelf there's nothing to read yet, so the button asks you to write instead
export function JournalHero({ hasBooks, onOpen, disabled = false }) {
  return (
    <div className="flex max-w-lg flex-col gap-4">
      <h1 className={`${bookSerif.className} text-4xl leading-[1.05] sm:text-5xl`}>Your story, kept.</h1>
      <p className="text-sm leading-relaxed text-foreground/60">
        Every entry you’ve written, bound like books on a shelf. Pick one up whenever you want to read where you’ve
        been.
      </p>
      <button
        type="button"
        onClick={onOpen}
        disabled={disabled}
        style={{ "--lift": "var(--solid-lift)" }}
        className="milo-lift flex w-fit cursor-pointer items-center gap-1.5 rounded-full bg-solid px-5 py-2 text-sm text-solid-ink hover:bg-solid-hover disabled:cursor-default disabled:opacity-50"
      >
        {hasBooks ? "Start reading" : "Start writing"}
        <ArrowUpRight className="size-4" />
      </button>
    </div>
  );
}
