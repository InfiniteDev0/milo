"use client";

/* What's new, as beui's todo list, small, sitting just above Milo's face at
   the bottom right of the home page.

   First it's a list with Start under it. Once started, the list shows just the
   step to do now (in green), and the whole screen blurs except the place that
   step happens (spotlight.jsx), so only that asks for attention.
   Steps tick themselves as you do them anywhere in Milo (steps.js), started or
   not, and the next one comes into focus the moment one is done. Finishing
   fires the confetti and Milo says welcome; the list closes up and goes.

   It shows on every page until every step is done, then never again — until a
   new update ships a new VERSION in steps.js and it shows once more. Skip moves
   past a step without doing it; × ends the whole tour (both asked for on 6 Nov,
   replacing the earlier no-way-out rule). Help › Tutorial plays it again. Where you are (started, done, closed) is kept on your
   profile (profiles.tour, migration 0017), so it never comes back once
   finished; before 0017 it doesn't show at all. */

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { TodoList } from "@/components/agents/todo-list";
import { loadTour, saveTour } from "@/lib/db/tour";
import { sideCannons } from "../confetti";
import { showWelcome } from "./welcome-toast";
import { Spotlight } from "./spotlight";
import { Pointer } from "./pointer";
import { STEPS, VERSION, onReplay, onStep } from "./steps";

// Milo's green to blue, drawn as an inline style so it can't lose to a class
const GRADIENT = {
  backgroundImage: "linear-gradient(90deg, #00b86b, #06b6d4, #2f80ed)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};



export function WhatsNew() {
  // every page, so a step that lives elsewhere (a category in Notes) can be done with the list in sight
  const pathname = usePathname();
  // null until read (or if it can't be): { userId, done: Set, started, closed }
  const [state, setState] = useState(null);
  // the step just done: it stays a moment so its check plays on it, then the next one comes
  const [justDone, setJustDone] = useState(null);
  // the newest state, for handlers that run outside a render
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  }, [state]);

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

  // a step done anywhere ticks here and is kept; its check plays before the next step comes
  useEffect(
    () =>
      onStep((id) => {
        const s = latest.current;
        if (!s || s.closed || s.done.has(id) || !STEPS.some((x) => x.id === id)) return;
        const next = { ...s, done: new Set([...s.done, id]) };
        latest.current = next;
        setState(next);
        save(next);
        if (s.started) setJustDone(id);
      }),
    [],
  );
  useEffect(() => {
    if (!justDone) return;
    const t = setTimeout(() => setJustDone(null), 1300);
    return () => clearTimeout(t);
  }, [justDone]);

  // the confetti and welcome, once per run through the steps
  const celebrated = useRef(false);

  // Help › Tutorial: back to the first step, already started, the spotlight on it
  useEffect(
    () =>
      onReplay(() => {
        celebrated.current = false;
        setJustDone(null);
        setState((s) => {
          if (!s) return s;
          const next = { ...s, done: new Set(), started: true, closed: false };
          save(next);
          return next;
        });
      }),
    [],
  );

  const allDone = state ? STEPS.every((x) => state.done.has(x.id)) : false;

  // all done (and the last check seen): confetti in Milo's colours and a welcome, once; then away for good
  const open = Boolean(state && !state.closed);
  useEffect(() => {
    if (!allDone || !open || justDone) return;
    if (!celebrated.current) {
      celebrated.current = true;
      sideCannons(["#00b86b", "#06b6d4", "#2f80ed", "#ffd600"]);
      showWelcome();
    }
    const t = setTimeout(() => change({ closed: true }), 2500);
    return () => clearTimeout(t);
    // change only reads the latest state through setState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, open, justDone]);

  if (!pathname || !state || state.closed) return null;

  // the step shown: the one just done while its check plays, else the next one left to do
  const nextStep = STEPS.find((x) => !state.done.has(x.id)) ?? null;
  const looked = state.started ? (STEPS.find((x) => x.id === justDone) ?? nextStep) : null;
  const at = looked ? STEPS.indexOf(looked) : -1;
  // a plain circle while it waits (no spinner); the check, drawn on the step itself, once done
  const items = STEPS.map((x) => ({ id: x.id, title: x.title, status: state.done.has(x.id) ? "completed" : "pending" }));

  // Skip: past this step without doing it (it counts as seen)
  const skip = () => {
    if (!looked || state.done.has(looked.id)) return;
    setJustDone(null);
    change({ done: new Set([...state.done, looked.id]) });
  };

  // ‹ goes back a step and starts again from there: that step and every one after it open again
  const back = () => {
    if (at <= 0) return;
    const from = at - 1;
    setJustDone(null);
    change({ done: new Set([...state.done].filter((id) => STEPS.findIndex((x) => x.id === id) < from)) });
  };

  return (
    <>
    {/* the rest of the screen out of focus, the current step's place clear */}
    {looked && <Spotlight targets={looked.targets} />}
    {/* the moving pointer, tapping the exact thing to press — only on a step not done yet */}
    {looked && !state.done.has(looked.id) && <Pointer targets={looked.point ?? looked.targets} />}
    {/* once started: only the step shown, its words bright and its circle green while it waits */}
    {looked && (
      <style>{`.whats-new li:not([data-id="${looked.id}"]) { display: none; }
.whats-new li [class*="text-muted-foreground"] { color: var(--foreground) !important; }
.whats-new li svg { color: #00b86b !important; }`}</style>
    )}
    {/* above Milo's face (bottom-12, 3rem tall), its right edge level with it, and above the blur */}
    {/* phones: above the tab bar instead */}
    <div className="fixed right-6 bottom-[6.75rem] z-[45] w-72 max-w-[calc(100vw-2rem)] max-md:right-4 max-md:bottom-[calc(env(safe-area-inset-bottom)+5.75rem)]">
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
          className={`border-0 bg-transparent text-[13px] [&_li]:transition-[filter,opacity,background-color] [&_li:hover]:bg-foreground/[0.06] ${state.started ? "whats-new" : ""}`}
        />
        {looked && (
          <div className="flex flex-col gap-2 px-3 pb-2.5">
            {/* how to do it, in one line */}
            <p className="px-1.5 text-xs leading-relaxed text-muted-foreground">{looked.hint}</p>
            {/* ‹ back a step (starting again from there), and where you are */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                disabled={at <= 0}
                onClick={back}
                aria-label="Go back a step"
                className="flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-foreground/[0.06] hover:text-foreground disabled:cursor-default disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="tabular-nums">
                Step {at + 1} of {STEPS.length}
              </span>
              {!state.done.has(looked.id) && (
                <button
                  type="button"
                  onClick={skip}
                  className="ms-auto h-7 cursor-pointer rounded-md px-2.5 font-medium transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        )}
        {/* × ends the whole tour, for good (Help › Tutorial brings it back) */}
        <button
          type="button"
          onClick={() => {
            setJustDone(null);
            change({ closed: true });
          }}
          aria-label="End What's new"
          className="absolute -top-2 -right-2 flex size-6 cursor-pointer items-center justify-center rounded-full border border-border bg-popover text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
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
    </>
  );
}
