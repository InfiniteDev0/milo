"use client";

/* What's new, as beui's todo list, small, sitting just above Milo's face at
   the bottom right of the home page.

   First it's a list with Start under it. Once started, the step to do now is
   green and every other step is blurred, so only that one asks for attention.
   Steps tick themselves as you do them anywhere in Milo (steps.js), started or
   not, and the next one comes into focus the moment one is done. Finishing
   fires the confetti and Milo says welcome; the list closes up and goes.

   MANDATORY (the user's rule, 5 Nov): there is no way to put it away early.
   It shows on every page until every step is done, then never again — until
   a new update ships a new VERSION in steps.js and it shows once more. Where you are (started, done, closed) is kept on your
   profile (profiles.tour, migration 0017), so it never comes back once
   finished; before 0017 it doesn't show at all. */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TodoList } from "@/components/agents/todo-list";
import { loadTour, saveTour } from "@/lib/db/tour";
import { sideCannons } from "../confetti";
import { showWelcome } from "./welcome-toast";
import { STEPS, VERSION, onStep } from "./steps";

// Milo's green to blue, drawn as an inline style so it can't lose to a class
const GRADIENT = {
  backgroundImage: "linear-gradient(90deg, #00b86b, #06b6d4, #2f80ed)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

// once started, every row but the current one goes soft and out of focus
const BLUR =
  "[&_li[data-status=completed]]:opacity-50 [&_li[data-status=completed]]:blur-[2px] [&_li[data-status=pending]]:opacity-50 [&_li[data-status=pending]]:blur-[2px]";

export function WhatsNew() {
  // every page, so a step that lives elsewhere (a category in Notes) can be done with the list in sight
  const pathname = usePathname();
  // null until read (or if it can't be): { userId, done: Set, started, closed }
  const [state, setState] = useState(null);

  useEffect(() => {
    let alive = true;
    loadTour()
      .then((r) => {
        if (!alive || !r) return;
        const t = r.tour.version === VERSION ? r.tour : {};
        setState({ userId: r.userId, done: new Set(t.done ?? []), started: Boolean(t.started), closed: Boolean(t.closed) });
      })
      .catch((err) => console.warn("[milo] could not read your What's new steps", err));
    return () => {
      alive = false;
    };
  }, []);

  const save = (next) => saveTour(next.userId, { version: VERSION, done: [...next.done], started: next.started, closed: next.closed });
  const change = (patch) =>
    setState((s) => {
      if (!s) return s;
      const next = { ...s, ...patch };
      save(next);
      return next;
    });

  // a step done anywhere ticks here and is kept
  useEffect(
    () =>
      onStep((id) =>
        setState((s) => {
          if (!s || s.closed || s.done.has(id) || !STEPS.some((x) => x.id === id)) return s;
          const next = { ...s, done: new Set([...s.done, id]) };
          save(next);
          return next;
        }),
      ),
    [],
  );

  const allDone = state ? STEPS.every((x) => state.done.has(x.id)) : false;

  // all done: confetti in Milo's colours and a welcome, once; a moment to see the ticks, then away for good
  const celebrated = useRef(false);
  const open = Boolean(state && !state.closed);
  useEffect(() => {
    if (!allDone || !open) return;
    if (!celebrated.current) {
      celebrated.current = true;
      sideCannons(["#00b86b", "#06b6d4", "#2f80ed", "#ffd600"]);
      showWelcome();
    }
    const t = setTimeout(() => change({ closed: true }), 2500);
    return () => clearTimeout(t);
    // change only reads the latest state through setState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, open]);

  if (!pathname || !state || state.closed) return null;

  const current = state.started ? STEPS.find((x) => !state.done.has(x.id))?.id : null;
  const items = STEPS.map((x) => ({
    id: x.id,
    title: x.title,
    status: state.done.has(x.id) ? "completed" : x.id === current ? "in-progress" : "pending",
  }));

  return (
    // above Milo's face (bottom-12, 3rem tall), its right edge level with it
    <div className="fixed right-6 bottom-[6.75rem] z-30 w-72 max-w-[calc(100vw-2rem)]">
      {/* its own grey in light mode (the page is white), the popover colour in dark; a firm edge, no shadow */}
      <div className="relative rounded-2xl border border-foreground/15 bg-muted dark:border-border dark:bg-popover">
        <TodoList
          items={items}
          title={
            <span className="font-semibold" style={GRADIENT}>
              What&apos;s new in Milo
            </span>
          }
          maxHeight={220}
          className={`border-0 bg-transparent text-[13px] [&_li]:transition-[filter,opacity,background-color] [&_li:hover]:bg-foreground/[0.06] ${state.started ? BLUR : ""}`}
        />
        {!state.started && !allDone && (
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={() => change({ started: true })}
              className="flex h-8 w-full cursor-pointer items-center justify-center rounded-xl bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-90"
            >
              Start
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
