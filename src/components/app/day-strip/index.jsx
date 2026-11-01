"use client";

// Tasks that don't belong to a block yet — park one on a day, or move it into a
// block later. Not a backlog: nothing here is ever late. See PRODUCT.md.

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Carousel } from "@/components/ui/carousel";
import { Header } from "./header";
import { Days } from "./days";

export function Tray() {
  const [open, setOpen] = useState(false);

  // same siblings problem as the block sheet: opener and panel have no shared parent
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("milo:open-tray", show);
    return () => window.removeEventListener("milo:open-tray", show);
  }, []);

  return (
    <Sheet side="bottom" open={open} onOpenChange={setOpen}>
      {/* The header lives inside the carousel so its buttons can drive it. */}
      <Carousel
        opts={{ align: "start" }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <Header />
        <Days />
        <div className="min-h-0 flex-1" />
      </Carousel>
    </Sheet>
  );
}
