// Throwaway: the vision board as a cosy desk of hand-drawn windows, with the Year page's rules kept inside them —
// wishes tied to blocks, days counted up, achieved ones ticked, and no window keeping score.

import { hand } from "./font";
import { ACHIEVED, DUMP, PLACES, TRY, ULTIMATE, WILL, YEAR } from "./data";
import { Chip, Days, Tick, WishLine } from "./bits";
import { SketchWindow } from "./sketch-window";

export const metadata = { title: "Vision board mockup — Milo" };

export default function VisionMockup() {
  return (
    <main
      className="min-h-svh px-4 py-10 sm:px-10"
      // a dotted desk
      style={{
        backgroundColor: "#F6F4F1",
        backgroundImage: "radial-gradient(#9b8a86 1.2px, transparent 1.3px)",
        backgroundSize: "26px 26px",
      }}
    >
      {/* one wobble shared by every window outline */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="sketchy">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
      </svg>

      <div className="mx-auto max-w-6xl columns-1 gap-7 md:columns-2 xl:columns-3">
        <SketchWindow bg="#FFFBF1" controls="dots" tilt={-1.2} big title="My vision board">
          <p className="text-center text-sm opacity-70">
            {YEAR.icon} {YEAR.name}
          </p>
        </SketchWindow>

        <SketchWindow bg="#EAE4F0" controls="dots" title="My ultimate goal">
          <p className={`${hand.className} text-center text-3xl leading-tight`}>{ULTIMATE.text}</p>
          <p className="text-center text-sm opacity-70">{YEAR.about}</p>
          <div className="flex flex-col items-center gap-2 pt-2">
            <Days n={ULTIMATE.days} />
            <div className="flex gap-1.5">
              {ULTIMATE.blocks.map((id) => (
                <Chip key={id} id={id} />
              ))}
            </div>
          </div>
        </SketchWindow>

        <SketchWindow bg="#FAE7C2" controls="dots" tilt={-0.8} title="Places I want to go">
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {PLACES.map((p) => (
              <WishLine key={p.text} {...p} />
            ))}
          </ul>
        </SketchWindow>

        <SketchWindow bg="#E3EBCB" controls="arrows" controlsRight tilt={0.7} title="This year I’ll…">
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {WILL.map((w) => (
              <li key={w.text} className="flex flex-col gap-1">
                <span className={`${hand.className} text-xl leading-snug`}>{w.text}</span>
                <div className="flex flex-wrap items-center gap-2 text-sm opacity-85">
                  {w.blocks.map((id) => (
                    <Chip key={id} id={id} />
                  ))}
                  <span>
                    <span className={`${hand.className} text-lg`}>{w.days}</span> days
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </SketchWindow>

        <SketchWindow bg="#F4D9C6" controls="dots" tilt={0.5} title="I wish to try…">
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {TRY.map((t) => (
              <WishLine key={t.text} {...t} />
            ))}
          </ul>
        </SketchWindow>

        <SketchWindow bg="#F0D7D6" controls="close" controlsRight tilt={1}>
          <p className={`${hand.className} py-4 text-center text-2xl leading-snug`}>“It’s okay to take a break.”</p>
          <div className="flex justify-center gap-3">
            {["Yes", "Also yes"].map((label) => (
              <button
                key={label}
                type="button"
                className={`${hand.className} cursor-pointer rounded-md border-[1.5px] border-current px-6 py-1 text-xl transition-transform hover:-translate-y-0.5`}
              >
                {label}
              </button>
            ))}
          </div>
        </SketchWindow>

        <SketchWindow bg="#E0EBEA" controls="controls" controlsRight tilt={-0.6} title="Brain dump">
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {DUMP.map((d) => (
              <li key={d} className={`${hand.className} text-xl`}>
                ~ {d}
              </li>
            ))}
          </ul>
          <p className="text-xs opacity-60">No block yet. Give one a home and it moves up the board.</p>
        </SketchWindow>

        <SketchWindow bg="#FFFBF1" controls="dots" tilt={0.4} title="Done & dusted">
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {ACHIEVED.map((a) => (
              <li key={a.text} className="flex items-start gap-2.5">
                <Tick />
                <span className="flex flex-col">
                  <span className={`${hand.className} text-xl leading-snug`}>{a.text}</span>
                  <span className="text-xs opacity-60">
                    {a.when} · {a.days} days you showed up for it
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </SketchWindow>
      </div>
    </main>
  );
}
