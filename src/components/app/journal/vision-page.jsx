"use client";

// The year's vision: your vision board's wishes as they stand on the Year page, and room to write the year out.

import { Check } from "lucide-react";
import { useVision } from "../year/use-vision";
import { bookHand, bookSerif } from "./font";
import { HandArea } from "./hand-line";
import { INK, LINE, pageBox } from "./paper";

const SHOWN = 6;

export function VisionPage({ page, side, edit, onPatch, foot }) {
  const { wishes } = useVision();
  const shown = wishes.filter((w) => w.status !== "set-down").slice(0, SHOWN);

  return (
    <div className="absolute flex flex-col" style={pageBox(side)}>
      <div
        className={`${bookSerif.className} flex shrink-0 items-baseline gap-[1.5cqw]`}
        style={{ height: `${LINE * 2}cqh`, fontSize: `${LINE * 0.9}cqh` }}
      >
        <span className="font-semibold">{page.stamp}</span>
        <span className="italic opacity-70">vision</span>
      </div>

      {shown.map((w) => (
        <p
          key={w.id}
          className={`${bookHand.className} flex shrink-0 items-center gap-[1.5cqw]`}
          style={{ height: `${LINE}cqh`, fontSize: `${LINE * 0.8}cqh`, color: INK }}
        >
          <span className="flex w-[3cqw] shrink-0 justify-center opacity-50">
            {w.status === "achieved" ? <Check style={{ width: `${LINE * 0.5}cqh`, height: `${LINE * 0.5}cqh` }} /> : "·"}
          </span>
          <span className="truncate">{w.text}</span>
        </p>
      ))}

      <HandArea value={page.body} edit={edit} label="Your vision" onChange={(v) => onPatch({ body: v })} />
      {foot}
    </div>
  );
}
