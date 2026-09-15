"use client";

// The Day ahead: today or tomorrow, one block at a time. Its own sheet, with a slide for a note, like the notes sheet.

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useShortcut } from "@/hooks/use-shortcut";
import { DAY_AHEAD_KEY } from "@/lib/shortcuts";
import { useNotes } from "../notes-provider";
import { NotePage } from "../tray/note-page";
import { PlanView } from "./plan-view";

export function DayAhead() {
  const { notes, editNote } = useNotes();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("today");
  const [api, setApi] = useState(null);
  const [noteId, setNoteId] = useState(null);

  // opened from the date menu and the day's reflection, which live elsewhere in the page
  useEffect(() => {
    const onOpen = (e) => {
      setTab(e.detail === "tomorrow" ? "tomorrow" : "today");
      setNoteId(null);
      setOpen(true);
    };
    window.addEventListener("milo:day-ahead", onOpen);
    return () => window.removeEventListener("milo:day-ahead", onOpen);
  }, []);

  // Ctrl/⌘+Shift+D opens it on today, and closes it again
  useShortcut(DAY_AHEAD_KEY, () => {
    setTab("today");
    setNoteId(null);
    setOpen((v) => !v);
  });

  const note = notes.find((n) => n.id === noteId) ?? null;

  const openNote = (id) => {
    setNoteId(id);
    api?.scrollTo(1);
  };

  return (
    <Sheet side="right" open={open} onOpenChange={setOpen}>
      {/* watchDrag off: the slides move by button, not by dragging the sheet */}
      <Carousel setApi={setApi} opts={{ watchDrag: false }} className="flex min-h-0 flex-1 flex-col">
        <CarouselContent
          insetClassName="flex min-h-0 flex-1 flex-col"
          viewportClassName="min-h-0 flex-1"
          className="h-full"
        >
          <CarouselItem className="h-full">
            <PlanView tab={tab} onTab={setTab} onOpenNote={openNote} />
          </CarouselItem>

          <CarouselItem className="h-full">
            <NotePage
              note={note}
              onChange={(patch) => editNote(noteId, patch)}
              onBack={() => api?.scrollTo(0)}
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </Sheet>
  );
}
