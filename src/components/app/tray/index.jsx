"use client";

// Today's notes. The list and an open note are two slides of one carousel, so opening one glides.
// Each slide carries its own header — a shared one would sit over the note too.
// It floats: the day behind it stays usable, clicking elsewhere doesn't close it, and it reopens on the note you had.

import { useEffect, useRef, useState } from "react";
import { GROW_TRANSITION, PANE_WIDTH, Sheet } from "@/components/ui/sheet";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useSheetPosition } from "@/hooks/use-sheet-position";
import { stampOf } from "@/lib/stamp";
import { useNow } from "@/lib/time";
import { useNotes } from "../notes-provider";
import { TrayHandle } from "./handle";
import { ListPage } from "./list-page";
import { NotePage } from "./note-page";
import { SheetGrip } from "./sheet-grip";

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
  // which slide is showing; kept while the sheet is closed, so it reopens where you were
  const [page, setPage] = useState("list");
  const [full, setFull] = useState(false);
  const position = useSheetPosition();
  const { notes, hydrated, loadFailed, canWrite, addNote, editNote } = useNotes();

  // a minute's tick is enough to roll the sheet over to a new day without a reload
  const now = useNow(true, 60000);
  // written today, or left for today; a note left for another day waits for that day instead
  const todayStamp = now == null ? null : stampOf(new Date(now));
  const today =
    now == null
      ? []
      : notes.filter((n) => (n.showOn ? n.showOn === todayStamp : n.createdAt >= dayStart(now)));
  const note = notes.find((n) => n.id === openId) ?? null;
  // a note deleted while the sheet was closed means reopening on the list
  const onNote = page === "note" && note !== null;

  // a freshly opened sheet lands straight on the slide you left, without gliding there
  const landOn = useRef(onNote);
  useEffect(() => {
    landOn.current = onNote;
  });
  useEffect(() => {
    api?.scrollTo(landOn.current ? 1 : 0, true);
  }, [api]);

  const show = (id) => {
    setOpenId(id);
    setPage("note");
    api?.scrollTo(1);
  };

  const add = () => {
    const fresh = addNote();
    if (fresh) show(fresh.id);
  };

  return (
    <>
      <Sheet
        // full screen always grows from the right, up to the nav rail
        side={full && onNote ? "right" : position}
        floating
        open={open}
        onOpenChange={setOpen}
        // the transition stays on both ways, so shrinking back glides like growing does
        style={{
          transition: GROW_TRANSITION,
          ...(full && onNote ? { width: PANE_WIDTH } : {}),
        }}
      >
        <SheetGrip position={position} />

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
                since={now == null ? null : dayStart(now)}
                loadFailed={loadFailed}
                canWrite={canWrite}
                onAdd={add}
                onOpen={show}
              />
            </CarouselItem>

            <CarouselItem className="h-full">
              <NotePage
                note={note}
                onChange={(patch) => editNote(openId, patch)}
                onBack={() => {
                  setPage("list");
                  api?.scrollTo(0);
                }}
                full={full}
                onToggleFull={() => setFull((v) => !v)}
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
