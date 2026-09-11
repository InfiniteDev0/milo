"use client";

// Today's notes. The list and an open note are two slides of one carousel, so
// opening one glides rather than swapping. Each slide carries its own header —
// a shared one would sit over the note as well, which is not its title.

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { TrayHandle } from "./handle";
import { ListPage } from "./list-page";
import { NotePage } from "./note-page";

export function Tray() {
  const [open, setOpen] = useState(false);
  const [api, setApi] = useState(null);

  // IN MEMORY ONLY. Nothing here survives a reload — the store is not decided.
  const [notes, setNotes] = useState([]);
  const [openId, setOpenId] = useState(null);

  const note = notes.find((n) => n.id === openId) ?? null;

  const add = () => {
    const fresh = { id: crypto.randomUUID(), title: "", body: "", preview: "", createdAt: Date.now() };
    setNotes((prev) => [fresh, ...prev]);
    setOpenId(fresh.id);
    api?.scrollTo(1);
  };

  const edit = (patch) =>
    setNotes((prev) => prev.map((n) => (n.id === openId ? { ...n, ...patch } : n)));

  return (
    <>
      <Sheet side="right" open={open} onOpenChange={setOpen}>
        {/* watchDrag off: the slides move by button, not by dragging the sheet */}
        <Carousel
          setApi={setApi}
          opts={{ watchDrag: false }}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* every link has to carry the height or h-full resolves against auto */}
          <CarouselContent
            insetClassName="flex min-h-0 flex-1 flex-col"
            viewportClassName="min-h-0 flex-1"
            className="h-full"
          >
            <CarouselItem className="h-full">
              <ListPage
                notes={notes}
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
                onChange={edit}
                onBack={() => api?.scrollTo(0)}
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </Sheet>

      {/* Rendered here, not in the shell, so the button knows whether the sheet
          is open and can say so. It portals itself to body regardless. */}
      <TrayHandle open={open} onToggle={() => setOpen((v) => !v)} />
    </>
  );
}
