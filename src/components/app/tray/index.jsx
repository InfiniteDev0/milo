"use client";

// Today's notes. The list and an open note are two slides of one carousel, so opening one glides.
// Each slide carries its own header — a shared one would sit over the note too.

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useNow } from "@/lib/time";
import { useNotes } from "../notes-provider";
import { TrayHandle } from "./handle";
import { ListPage } from "./list-page";
import { NotePage } from "./note-page";

// your own midnight, so "today" turns over when your day does
const dayStart = (ms) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function Tray() {
  const [open, setOpen] = useState(false);
  const [api, setApi] = useState(null);
  const [openId, setOpenId] = useState(null);
  const { notes, hydrated, loadFailed, canWrite, addNote, editNote } = useNotes();

  // a minute's tick is enough to roll the sheet over to a new day without a reload
  const now = useNow(true, 60000);
  const today = now == null ? [] : notes.filter((n) => n.createdAt >= dayStart(now));
  const note = notes.find((n) => n.id === openId) ?? null;

  const add = () => {
    const fresh = addNote();
    if (!fresh) return;
    setOpenId(fresh.id);
    api?.scrollTo(1);
  };

  return (
    <>
      <Sheet side="right" open={open} onOpenChange={setOpen}>
        {/* watchDrag off: the slides move by button, not by dragging the sheet */}
        <Carousel setApi={setApi} opts={{ watchDrag: false }} className="flex min-h-0 flex-1 flex-col">
          {/* every link has to carry the height or h-full resolves against auto */}
          <CarouselContent
            insetClassName="flex min-h-0 flex-1 flex-col"
            viewportClassName="min-h-0 flex-1"
            className="h-full"
          >
            <CarouselItem className="h-full">
              <ListPage
                notes={today}
                ready={hydrated && now != null}
                loadFailed={loadFailed}
                canWrite={canWrite}
                onAdd={add}
                onOpen={(id) => {
                  setOpenId(id);
                  api?.scrollTo(1);
                }}
              />
            </CarouselItem>

            <CarouselItem className="h-full">
              <NotePage
                note={note}
                onChange={(patch) => editNote(openId, patch)}
                onBack={() => api?.scrollTo(0)}
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </Sheet>

      {/* here, not in the shell, so the button knows whether the sheet is open */}
      <TrayHandle open={open} onToggle={() => setOpen((v) => !v)} />
    </>
  );
}
