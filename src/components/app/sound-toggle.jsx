"use client";

/* The mute switch.
 *
 * Same reasoning as the focus lock: anything the app does at you has to be
 * something you can stop. A reward sound you can't silence stops being a reward
 * about halfway through the first afternoon.
 *
 * Read after mount, never during render — localStorage during render makes the
 * server and the client disagree and React reports a hydration mismatch.
 */

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { playTask, setSoundOn, soundOn } from "@/lib/sound";
import { Button } from "../ui/button";

export function SoundToggle() {
  const [on, setOn] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOn(soundOn());
    setReady(true);
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    setSoundOn(next);
    // turning it on plays the smallest cue, so you hear what you just chose
    if (next) playTask();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              onClick={toggle}
              aria-pressed={on}
              aria-label={on ? "Turn sound off" : "Turn sound on"}
              className="flex size-9 cursor-pointer items-center justify-center rounded-xl  transition-colors hover:bg-black/5 hover:text-black/70"
            >
              {ready && !on ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </Button>
          }
        />
        <TooltipContent side="right">
          {on ? "Sound on" : "Sound off"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
