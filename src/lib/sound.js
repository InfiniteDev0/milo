"use client";

/* Milo's three sounds.
 *
 * Synthesised with the Web Audio API rather than shipped as files. That is
 * deliberate on two counts:
 *
 *   1. The reference clips are Duolingo's own audio. Milo is a paid product;
 *      using another company's assets in one is a takedown, not a warning.
 *   2. No files means no network request, no decode, and no latency — a reward
 *      sound that arrives 200ms late reads as a glitch, not a reward.
 *
 * FILES WIN IF THEY EXIST. Drop an audio file at any of these paths and it is
 * used instead of the synth, no code change:
 *
 *     web/public/sounds/lock.mp3
 *     web/public/sounds/task.mp3
 *     web/public/sounds/block.mp3
 *
 * (.mp3, .wav, .ogg and .m4a all work — see FILES below.) If a file isn't
 * there, the request fails quietly and the synthesised cue plays instead, so
 * a half-filled folder still works.
 *
 * THE RULE: sound only ever fires for something that HAPPENED. There is no
 * sound for a block you dropped, a day you ended early, or a task you moved
 * back — POSITIONING is explicit that Milo never marks an absence, and a sad
 * noise is the loudest way to mark one.
 */

const KEY = "milo:sound";

const FILES = {
  lock: ["/sounds/lock.mp3", "/sounds/lock.wav", "/sounds/lock.ogg", "/sounds/lock.m4a"],
  task: ["/sounds/task.mp3", "/sounds/task.wav", "/sounds/task.ogg", "/sounds/task.m4a"],
  block: ["/sounds/block.mp3", "/sounds/block.wav", "/sounds/block.ogg", "/sounds/block.m4a"],
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

  // first time: ask the browser which of the candidates it can actually play
  const audio = new Audio();
  const src = FILES[name].find((f) => {
    const ext = f.split(".").pop();
    const type = { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4" }[ext];
    return type && audio.canPlayType(type);
  });
  if (!src) {
    found[name] = false;
    return false;
  }

  audio.src = src;
  audio.oncanplaythrough = () => {
    found[name] = audio;
  };
  audio.onerror = () => {
    found[name] = false;
  };
  audio.load();

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
