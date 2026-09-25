"use client";

// What sits on one page besides free writing: a planner layout, the pinned strip, the ribbon and the page's tools.
// The same pieces draw a page that's still and one mid-turn; only a still page can be changed.

import { DayPlan } from "./day-plan";
import { DaySchedule } from "./day-schedule";
import { MonthPage } from "./month-page";
import { PageHead } from "./page-head";
import { PageWords } from "./page";
import { PageTools, Ribbon } from "./page-tools";
import { isPinned, listed, pageDate } from "./pages";
import { footBox } from "./paper";
import { Pinned } from "./pinned";
import { VisionPage } from "./vision-page";

const PLANNERS = { "day-schedule": DaySchedule, "day-plan": DayPlan, month: MonthPage, vision: VisionPage };

export const hasFoot = (page, voices) => page.kind !== "day-schedule" && (isPinned(page) || (voices?.length ?? 0) > 0);

// the days in a page's month that have something in this journal
function markedDays(page, pages) {
  const first = pageDate(page);
  const days = new Set();
  for (const p of pages ?? []) {
    if (!listed(p) || p.kind === "month" || p.kind === "vision") continue;
    const d = pageDate(p);
    if (d.getFullYear() === first.getFullYear() && d.getMonth() === first.getMonth()) days.add(d.getDate());
  }
  return days;
}

export function PlannerBody({ page, side, edit, book }) {
  const Planner = PLANNERS[page.kind];
  const voices = book.voices[page.id];
  const onPatch = (patch, wait) => book.patchPage(page.id, patch, wait);
  const foot = hasFoot(page, voices) ? (
    <Pinned
      page={page}
      voices={voices}
      edit={edit}
      onPatch={onPatch}
      onRemoveVoice={(id) => book.removeVoice(page.id, id)}
      className="shrink-0"
      style={{ height: footBox(side).height }}
    />
  ) : null;

  return (
    <Planner
      page={page}
      side={side}
      edit={edit}
      onPatch={onPatch}
      foot={foot}
      marked={page.kind === "month" ? markedDays(page, book.pages) : undefined}
    />
  );
}

// ribbon, tools, and a writing page's pinned strip
export function PageExtras({ page, side, edit, book }) {
  const voices = book.voices[page.id];
  const onPatch = (patch, wait) => book.patchPage(page.id, patch, wait);
  return (
    <>
      {page.bookmarked && <Ribbon side={side} />}
      {page.kind === "write" && hasFoot(page, voices) && (
        <Pinned
          page={page}
          voices={voices}
          edit={edit}
          onPatch={onPatch}
          onRemoveVoice={(id) => book.removeVoice(page.id, id)}
          className="absolute"
          style={footBox(side)}
        />
      )}
      {edit && (
        <PageTools page={page} side={side} onPatch={onPatch} onRemove={book.removePage} onVoice={book.recordVoice} />
      )}
    </>
  );
}

// a page as it is, drawn without anything to type into: for a leaf mid-turn
export function StillPage({ slot, side, book }) {
  if (!slot) return null;
  if (slot.kind !== "write") {
    return (
      <>
        <PlannerBody page={slot} side={side} edit={false} book={book} />
        <PageExtras page={slot} side={side} edit={false} book={book} />
      </>
    );
  }
  return (
    <>
      {slot.heads && <PageHead page={slot} side={side} />}
      <PageWords side={side} text={slot.body} head={slot.heads} foot={hasFoot(slot, book.voices[slot.id])} />
      <PageExtras page={slot} side={side} edit={false} book={book} />
    </>
  );
}
