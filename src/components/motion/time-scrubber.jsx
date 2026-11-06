"use client";

// bencho.dev — Time scrubber (MIT, bencho.dev/licence). Ported to JavaScript for Milo, with two
// additions: onChange, which reports the minutes it settles on, and the tick sound its hear() was
// written for (the same tick the date wheel plays), firmer on the hour. Styles are in globals.css under
// "Time scrubber", with Bencho's design tokens mapped to Milo's on .tms itself.

import { useEffect, useRef, useState } from "react";
import { createTickPlayer } from "@/lib/tick-sound";

/* ══ Time scrubber ════════════════════════════════════════
   A time over a ruler. Drag the ruler under the centre mark and
   the time runs with it; fling it and it coasts, then settles on
   the nearest step.

   ── ONE SPRING FOR THE THROW AND THE SNAP ───────────────
   On release the landing is decided at once: where the ruler
   would coast to at the speed it was let go, rounded to the
   nearest step. Then one spring carries it there, starting with
   the hand's own velocity — so a flick coasts and a slow
   release just settles, and there is no seam between "gliding"
   and "snapping" because they are the same motion.

   ── A DIAL SEEN FROM THE FRONT ──────────────────────────
   Ticks at the centre stand tall and dark and fall away toward
   the edges, in height and in ink, which is what makes a flat
   strip read as the face of a wheel. Only the ticks near the
   window are drawn at all, so a day of them costs thirty. */

/* ── inlined from lab/spring ──────────────────────── */
/* ── one spring, for everything that settles ───────────────
   Frames, not milliseconds. `dt` is expressed in sixtieths of
   a second and the damping is RAISED to it rather than
   multiplied by it, so a dropped frame decays the same amount
   of energy as the two frames it replaced. Multiplying is the
   version that makes a spring behave differently on a busy
   page, which is the hardest kind of bug to see.

   The loop parks itself the moment the value has settled —
   no permanent requestAnimationFrame. */

/* Read once. A preference, not a live input. */
const stillness = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const W = 300;
/* px per minute along the ruler */
const PX = 2;
const HALF = (W - 36) / 2;
const DAY = 1440;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wrap = (m) => ((m % DAY) + DAY) % DAY;

/* ── a digit that rolls, through a window that fades ────────
   A strip of 0–9 slides to the digit — but the window it slides
   through is taller than the line and fades to nothing at its
   top and bottom instead of clipping. Each digit sits in a cell
   with room above and below it, so at rest the neighbours are
   wholly outside the window, and on the move a digit leaves and
   arrives through the fade rather than being sliced by an edge.
   It smears a little while it rolls: a short blur restarted on
   every change, two names taken in turn because re-applying the
   same one does not replay. */
function Digit({ d }) {
  // Milo: kept in state rather than refs (React's rules don't allow a ref to change during render);
  // the same thing — the flip alternates each time the digit changes, decided in that render
  const [prev, setPrev] = useState(d);
  const [flip, setFlip] = useState(null);
  if (prev !== d) {
    setPrev(d);
    setFlip((f) => !f);
  }
  return (
    <span className="tms-col">
      <span
        className="tms-strip"
        data-flip={flip === null ? undefined : flip ? "a" : "b"}
        style={{ transform: `translateY(${-Number(d) * 1.5}em)` }}
      >
        {"0123456789".split("").map((n) => (
          <span key={n}>{n}</span>
        ))}
      </span>
    </span>
  );
}

function label(m, h24) {
  const t = wrap(Math.round(m));
  const h = Math.floor(t / 60);
  const mm = String(t % 60).padStart(2, "0");
  if (h24) return { time: `${String(h).padStart(2, "0")}:${mm}`, mer: "" };
  return { time: `${h % 12 || 12}:${mm}`, mer: h < 12 ? "AM" : "PM" };
}

export function TimeScrubber({
  /* what it settles on, minutes */
  step = "15",
  /* how far a fling carries, 0..100 */
  momentum = 50,
  format = "12h",
  corner = 20,
  /* where it starts, minutes after midnight */
  start = 570,
  /* Milo: the minutes after midnight it settles on, each time it does */
  onChange,
  /* Milo: whether it ticks as it turns */
  sound: ticking = true,
} = {}) {
  const still = stillness();
  const [pos, setPos] = useState(start);
  const p = useRef({ x: start, v: 0, to: start });
  const raf = useRef(0);
  const knobs = useRef({ step: Number(step) || 15, momentum, onChange, ticking });
  useEffect(() => {
    knobs.current = { step: Number(step) || 15, momentum, onChange, ticking };
  });
  const ruler = useRef(null);
  const lastStep = useRef(Math.floor(start / (Number(step) || 15)));

  /* a tick under the thumb for every step crossed, a firmer one
     on the hour */
  const player = useRef(null);
  const sound = () => (player.current ??= createTickPlayer());
  useEffect(() => () => player.current?.dispose(), []);
  const hear = (x) => {
    const s = knobs.current.step;
    const k = Math.floor(x / s);
    if (k === lastStep.current) return;
    lastStep.current = k;
    // lower and fuller on the hour, the plain tick on every other step — unless the sound is off
    if (knobs.current.ticking) sound().play(wrap(k * s) % 60 === 0 ? 0.8 : 1);
  };

  const set = (x) => {
    p.current.x = x;
    hear(x);
    setPos(x);
  };

  // Milo: said once it has come to rest
  const settled = (x) => knobs.current.onChange?.(wrap(Math.round(x)));

  const run = () => {
    if (raf.current) return;
    let prev = 0;
    const tick = (t) => {
      const dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1;
      prev = t;
      const c = p.current;
      /* near-critical: glides in and lands with a hint of give,
         no swing back and no slow creep at the end */
      c.v += ((c.to - c.x) * 0.022 - c.v * 0.26) * dt;
      const x = c.x + c.v * dt;
      if (Math.abs(c.to - x) < 0.01 && Math.abs(c.v) < 0.01) {
        c.v = 0;
        set(c.to);
        raf.current = 0;
        settled(c.to);
        return;
      }
      set(x);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    },
    [],
  );

  /* go to a time, by the spring */
  const goTo = (to, v = p.current.v) => {
    p.current.to = to;
    p.current.v = v;
    if (still) {
      p.current.v = 0;
      set(to);
      settled(to);
      return;
    }
    run();
  };

  /* ── the drag ──────────────────────────────────────────── */
  const drag = useRef(null);

  const onDown = (e) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* a scripted pointer */
    }
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    // the audio wakes on the press, so the first tick isn't late
    sound().prepare();
    const k = e.currentTarget.getBoundingClientRect().width / e.currentTarget.offsetWidth || 1;
    drag.current = { x: e.clientX, t: performance.now(), v: 0, k };
    p.current.v = 0;
  };

  const onMove = (e) => {
    const g = drag.current;
    if (!g) return;
    const now = performance.now();
    /* left is later: the ruler moves under a fixed mark */
    const dm = -(e.clientX - g.x) / g.k / PX;
    const dt = Math.max(1, now - g.t) / 16.67;
    g.v = g.v * 0.5 + (dm / dt) * 0.5;
    g.x = e.clientX;
    g.t = now;
    set(p.current.x + dm);
  };

  const onUp = (e) => {
    const g = drag.current;
    drag.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* never captured */
    }
    if (!g) return;
    /* a hand that stopped before letting go threw nothing */
    /* capped, so a flick spins it hours, never days */
    const v = performance.now() - g.t > 80 ? 0 : clamp(g.v, -14, 14);
    const s = knobs.current.step;
    const carry = 6 + (clamp(knobs.current.momentum, 0, 100) / 100) * 30;
    const land = Math.round((p.current.x + v * carry) / s) * s;
    /* the landing already includes the throw, so the spring starts
       with only part of the hand's speed — the whole of it on top
       would carry it well past the step and swing back */
    goTo(land, v * 0.6);
  };

  /* a trackpad's sideways swipe moves it too — only sideways, so
     scrolling the page past the block is never caught */
  useEffect(() => {
    const el = ruler.current;
    if (!el) return;
    let idle = 0;
    const wheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      set(p.current.x + e.deltaX / PX);
      clearTimeout(idle);
      idle = window.setTimeout(() => {
        const s = knobs.current.step;
        goTo(Math.round(p.current.x / s) * s, 0);
      }, 120);
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", wheel);
      clearTimeout(idle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── the ticks in the window ───────────────────────────── */
  const ticks = [];
  const span = HALF / PX + 10;
  for (let m = Math.ceil((pos - span) / 5) * 5; m <= pos + span; m += 5) {
    const x = (m - pos) * PX;
    const f = clamp(1 - Math.pow(Math.abs(x) / HALF, 2), 0, 1);
    const w = wrap(m);
    ticks.push({ m, x, f, kind: w % 60 === 0 ? "hour" : w % 15 === 0 ? "quarter" : "five" });
  }

  const h24 = format === "24h";
  const { time, mer } = label(pos, h24);
  const s = Number(step) || 15;

  return (
    <div className="tms" style={{ "--tms-r": `${Math.max(0, corner)}px` }}>
      <div className="tms-read" aria-live="polite" aria-label={`${time} ${mer}`}>
        <span className="tms-time">
          {time.split("").map((c, i) =>
            c === ":" ? (
              <span key={`c${i}`} className="tms-colon">
                :
              </span>
            ) : (
              <Digit key={time.length - i} d={c} />
            ),
          )}
        </span>
        {mer && <span className="tms-mer">{mer}</span>}
      </div>
      <div
        ref={ruler}
        className="tms-ruler"
        role="slider"
        tabIndex={0}
        aria-label="Time"
        aria-valuetext={`${time} ${mer}`}
        aria-valuenow={wrap(Math.round(pos))}
        aria-valuemin={0}
        aria-valuemax={DAY - 1}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={(e) => {
          const d = e.key === "ArrowRight" ? s : e.key === "ArrowLeft" ? -s : 0;
          if (!d) return;
          e.preventDefault();
          goTo(Math.round(p.current.to / s) * s + d, 0);
        }}
      >
        <div className="tms-track">
          {ticks.map((t) => (
            <span
              key={t.m}
              className="tms-tick"
              data-kind={t.kind}
              style={{
                transform: `translateX(${t.x.toFixed(2)}px) scaleY(${(0.55 + 0.45 * t.f).toFixed(3)})`,
                opacity: 0.18 + 0.82 * t.f,
              }}
            />
          ))}
          {ticks
            .filter((t) => t.kind === "hour")
            .map((t) => {
              const h = Math.floor(wrap(t.m) / 60);
              return (
                <span
                  key={`l${t.m}`}
                  className="tms-hour"
                  style={{ transform: `translateX(${t.x.toFixed(2)}px) translateX(-50%)`, opacity: 0.15 + 0.85 * t.f }}
                >
                  {h24 ? String(h).padStart(2, "0") : `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`}
                </span>
              );
            })}
        </div>
        <span className="tms-mark" aria-hidden="true" />
      </div>
    </div>
  );
}
