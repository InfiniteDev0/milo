// A hand-drawn window: wobbly outline, a title bar with its own little controls, and a pastel page inside.

import { hand } from "./font";

const INK = "#6B5550";

function Controls({ kind }) {
  if (kind === "dots") {
    return (
      <span className="flex items-center gap-1" aria-hidden>
        <span className="size-2 rounded-full" style={{ backgroundColor: INK }} />
        <span className="size-2 rounded-full border" style={{ borderColor: INK }} />
        <span className="size-2 rounded-full border" style={{ borderColor: INK }} />
      </span>
    );
  }
  if (kind === "arrows") {
    return (
      <span className="flex items-center gap-1 text-xs leading-none" aria-hidden>
        <span className="rounded-[3px] border px-1" style={{ borderColor: INK }}>‹</span>
        <span className="rounded-[3px] border px-1" style={{ borderColor: INK }}>›</span>
      </span>
    );
  }
  if (kind === "close") {
    return (
      <span className="flex size-4 items-center justify-center rounded-full border text-[10px] leading-none" style={{ borderColor: INK }} aria-hidden>
        ×
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs leading-none" aria-hidden>
      <span>×</span>
      <span className="size-2.5 border" style={{ borderColor: INK }} />
      <span>–</span>
    </span>
  );
}

export function SketchWindow({ title, bg, controls = "dots", controlsRight = false, tilt = 0, big = false, children }) {
  return (
    <section
      className="milo-on-tint relative mb-7 break-inside-avoid"
      style={{ transform: `rotate(${tilt}deg)`, color: INK }}
    >
      {/* the outline wobbles through an SVG filter; the text inside stays crisp */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[12px_16px_10px_14px] border-[1.6px]"
        style={{ borderColor: INK, filter: "url(#sketchy)", boxShadow: `3px 4px 0 ${INK}22` }}
      />

      <div className="overflow-hidden rounded-[12px_16px_10px_14px]" style={{ backgroundColor: bg }}>
        <div
          className={`flex items-center border-b-[1.5px] px-3 py-1.5 ${controlsRight ? "flex-row-reverse" : ""}`}
          style={{ borderColor: `${INK}99` }}
        >
          <Controls kind={controls} />
        </div>

        <div className="flex flex-col gap-3 px-5 pt-3 pb-5">
          {title && (
            <h2 className={`${hand.className} text-center leading-tight ${big ? "text-4xl" : "text-2xl"}`}>{title}</h2>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
