"use client";

/* Milo's three sounds.
 *
 * Plays a file when one is there, and synthesises the cue when one isn't.
 *
 * The files live in web/public/sounds and are named in FILES below. Nothing
 * else needs to change to swap a clip — rename the new one over the old.
 *
 * The synth is the fallback, not the plan: a missing or slow file becomes a
 * quieter version of the same moment rather than silence, which is what makes
 * the very first play work before anything has finished loading.
 *
 * THE RULE: sound only ever fires for something that HAPPENED. There is no
 * sound for a block you dropped, a day you ended early, or a task you moved
 * back — POSITIONING is explicit that Milo never marks an absence, and a sad
 * noise is the loudest way to mark one.
 */

const KEY = "milo:sound";

/* The files in web/public/sounds, first match wins. Generic names are listed
   after the real ones so replacing a clip later is a rename, not an edit. */
const FILES = {
  lock: [
    "/sounds/duolingo_correct.mp3",
    "/sounds/lock.mp3",
    "/sounds/lock.wav",
  ],
  task: [
    "/sounds/duolingo.mp3",
    "/sounds/task.mp3",
    "/sounds/task.wav",
  ],
  block: [
    "/sounds/Duolingo_completed_lesson.mp3",
    "/sounds/block.mp3",
    "/sounds/block.wav",
  ],
};

/* Which of those actually exist, worked out once and remembered. `false` means
   checked and absent — the synth handles it and we never ask again. */
const found = {};

let ctx = null;

/* Created on the first play, never at import. Browsers refuse an AudioContext
   until the user has interacted with the page, and one built too early lands in
   a suspended state that never recovers on its own. */
function audio() {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctx = new Ctx();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function soundOn() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on) {
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
}

/* One note. `to` slides the pitch, which is what separates a chime from a beep.
   Every envelope ends in an exponential ramp to near-silence — cutting a gain
   node to zero clicks, and a click is the one sound nobody wants. */
function note({ freq, at = 0, dur = 0.18, type = "sine", gain = 0.12, to }) {
  const c = audio();
  if (!c) return;

  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const amp = c.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);

  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  osc.connect(amp).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/* Try the file first, fall back to the synth. The fallback is what makes a
   missing file a non-event rather than a silent bug. */
function file(name) {
  if (typeof window === "undefined") return false;
  if (found[name] === false) return false;

  if (found[name]) {
    try {
      const a = found[name].cloneNode();
      a.volume = 0.6;
      a.play().catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  /* Walk the candidates until one actually loads. canPlayType only says the
     browser understands the FORMAT — a name that is listed but not on disk
     passes it and then 404s, so the file has to be tried, not just typed. */
  const tryFrom = (i) => {
    const src = FILES[name][i];
    if (!src) {
      found[name] = false;
      return;
    }
    const el = new Audio();
    el.preload = "auto";
    el.src = src;
    el.oncanplaythrough = () => {
      found[name] = el;
    };
    el.onerror = () => tryFrom(i + 1);
    el.load();
  };
  tryFrom(0);

  // nothing to play yet on this first call; the synth covers it
  return false;
}

const play = (name, fn) => {
  if (!soundOn()) return;
  try {
    if (file(name)) return;
    fn();
  } catch {}
};

// a cue with no clip behind it, only the synth
const synth = (fn) => {
  if (!soundOn()) return;
  try {
    fn();
  } catch {}
};

/* Fetch all three now, while nothing is happening. Loading a clip is just a
   network request — no user gesture required, unlike PLAYING one — so by the
   time the first task lands the file is decoded and ready. Without this the
   first completion of every session would fall through to the synth. */
if (typeof window !== "undefined") {
  Object.keys(FILES).forEach((name) => file(name));
}

/* Locking in. Two notes rising a fifth — the shortest phrase that reads as
   "yes" rather than "ping". */
export const playLock = () =>
  play("lock", () => {
    note({ freq: 523.25, dur: 0.12, gain: 0.1 }); // C5
    note({ freq: 783.99, at: 0.1, dur: 0.22, gain: 0.11 }); // G5
  });

/* A task done. One bright blip that slides upward — small, because it happens
   often and anything longer would start to nag. */
export const playTask = () =>
  play("task", () => {
    note({
      freq: 660,
      to: 990,
      dur: 0.14,
      type: "triangle",
      gain: 0.1,
    });
  });

/* A block finished, or the day. A major arpeggio with the octave held longest:
   the one moment in the app that is allowed to be pleased with itself. */
export const playBlock = () =>
  play("block", () => {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) =>
      note({
        freq,
        at: i * 0.085,
        dur: i === notes.length - 1 ? 0.5 : 0.18,
        type: "triangle",
        gain: 0.1,
      }),
    );
  });

// Notes put away: one soft note sliding down, like a drawer closing — quieter than the rest.
export const playTuck = () =>
  synth(() => {
    note({ freq: 587.33, to: 392, dur: 0.16, type: "sine", gain: 0.08 });
  });
