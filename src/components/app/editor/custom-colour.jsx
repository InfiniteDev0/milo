"use client";

// Any colour at all: drag the square for how light and strong, the strip for the hue, or type a hex.

import { useState } from "react";
import {
  ColorArea,
  ColorField,
  ColorSlider,
  ColorSwatch,
  ColorThumb,
  Input,
  SliderTrack,
  parseColor,
} from "react-aria-components";

const THUMB =
  "size-5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.3)] data-[dragging]:size-6";

// a colour the picker can't read falls back to blue rather than breaking
const start = (hex) => {
  try {
    return parseColor(hex).toFormat("hsb");
  } catch {
    return parseColor("#2563eb").toFormat("hsb");
  }
};

export function CustomColour({ initial, onPick }) {
  const [value, setValue] = useState(() => start(initial));

  return (
    <div className="flex flex-col gap-2.5 rounded-lg bg-foreground/4 p-2">
      <ColorArea
        aria-label="Shade"
        value={value}
        onChange={setValue}
        colorSpace="hsb"
        xChannel="saturation"
        yChannel="brightness"
        className="h-28 w-full rounded-md"
      >
        <ColorThumb className={THUMB} />
      </ColorArea>

      <ColorSlider aria-label="Hue" value={value} onChange={setValue} channel="hue" colorSpace="hsb">
        <SliderTrack className="h-5 w-full rounded-md">
          <ColorThumb className={`${THUMB} top-1/2`} />
        </SliderTrack>
      </ColorSlider>

      <div className="flex items-center gap-2">
        <ColorSwatch color={value} className="size-8 shrink-0 rounded-md ring-1 ring-foreground/10" />

        <ColorField
          aria-label="Hex colour"
          value={value}
          onChange={(c) => c && setValue(c.toFormat("hsb"))}
          className="min-w-0 flex-1"
        >
          <Input className="h-8 w-full rounded-md border border-foreground/10 bg-card px-2 text-xs uppercase outline-none focus:border-foreground/30" />
        </ColorField>

        <button
          type="button"
          onClick={() => onPick(value.toString("hex"))}
          className="h-8 shrink-0 cursor-pointer rounded-md bg-solid px-3 text-xs text-solid-ink hover:bg-solid-hover"
        >
          Use
        </button>
      </div>
    </div>
  );
}
