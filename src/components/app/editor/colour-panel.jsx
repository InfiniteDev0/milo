"use client";

// Colour for the selected words: the text itself, or a highlight behind it. Presets with deep shades, or any colour you pick.

import { useState } from "react";
import { Ban } from "lucide-react";
import { DEEP_COLOURS, HIGHLIGHTS, RAINBOW, TEXT_COLOURS } from "@/lib/text-colours";
import { CustomColour } from "./custom-colour";

// a swatch never takes focus from the editor, so the selection stays put
const keep = (e) => e.preventDefault();

function Swatch({ label, active, onPick, style, className = "", children }) {
  return (
    <button
      type="button"
      onMouseDown={keep}
      onClick={onPick}
      aria-label={label}
      aria-pressed={!!active}
      title={label}
      style={style}
      className={`flex size-7 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110 ${
        active ? "ring-2 ring-foreground/70" : "ring-1 ring-foreground/10"
      } ${className}`}
    >
      {children}
    </button>
  );
}

const same = (a, b) => (a ?? "").toLowerCase() === (b ?? "").toLowerCase();

export function ColourPanel({ editor, color, highlight }) {
  // which colour the picker is open for: "text", "highlight", or none
  const [custom, setCustom] = useState(null);

  const setText = (hex) => {
    const chain = editor.chain().focus();
    (hex ? chain.setColor(hex) : chain.unsetColor()).run();
  };

  const setHighlight = (hex) => {
    const chain = editor.chain().focus();
    (hex ? chain.setHighlight({ color: hex }) : chain.unsetHighlight()).run();
  };

  return (
    <div className="flex w-64 flex-col gap-3 p-2">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-foreground/50">Text colour</span>
        <div className="grid grid-cols-6 gap-1.5">
          <Swatch label="Default" active={!color} onPick={() => setText(null)} className="bg-foreground/5 text-foreground">
            <span className="text-sm font-medium">A</span>
          </Swatch>
          {TEXT_COLOURS.map((c) => (
            <Swatch key={c.hex} label={c.label} active={same(color, c.hex)} onPick={() => setText(c.hex)} className="bg-foreground/5">
              <span className="text-sm font-semibold" style={{ color: c.hex }}>
                A
              </span>
            </Swatch>
          ))}
          {/* deep inks as filled circles, so they read on a dark menu as well as a light one */}
          {DEEP_COLOURS.map((c) => (
            <Swatch
              key={c.hex}
              label={c.label}
              active={same(color, c.hex)}
              onPick={() => setText(c.hex)}
              style={{ backgroundColor: c.hex }}
            >
              <span className="text-sm font-semibold text-white">A</span>
            </Swatch>
          ))}
          <Swatch
            label="Any colour"
            active={custom === "text"}
            onPick={() => setCustom(custom === "text" ? null : "text")}
            style={{ background: RAINBOW }}
          />
        </div>
        {custom === "text" && (
          <CustomColour
            initial={color ?? "#2563eb"}
            onPick={(hex) => {
              setText(hex);
              setCustom(null);
            }}
          />
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-foreground/8 pt-3">
        <span className="text-xs text-foreground/50">Highlight</span>
        <div className="grid grid-cols-6 gap-1.5">
          <Swatch label="No highlight" active={!highlight} onPick={() => setHighlight(null)} className="bg-card text-foreground/45">
            <Ban className="size-3.5" />
          </Swatch>
          {HIGHLIGHTS.map((c) => (
            <Swatch
              key={c.hex}
              label={c.label}
              active={same(highlight, c.hex)}
              onPick={() => setHighlight(c.hex)}
              style={{ backgroundColor: c.hex }}
            />
          ))}
          <Swatch
            label="Any colour"
            active={custom === "highlight"}
            onPick={() => setCustom(custom === "highlight" ? null : "highlight")}
            style={{ background: RAINBOW }}
          />
        </div>
        {custom === "highlight" && (
          <CustomColour
            initial={highlight ?? "#fef08a"}
            onPick={(hex) => {
              setHighlight(hex);
              setCustom(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
