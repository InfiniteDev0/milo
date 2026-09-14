"use client";

/* POSITIONING commitment 9 made real: the user sets how often Milo speaks,
   INCLUDING NEVER. Every one of these can be turned off, and turning one off is
   a complete answer that produces no warning and no consequence. */

import { useEffect, useState } from "react";
import { setSoundOn, soundOn } from "@/lib/sound";
import { useBlocks } from "@/components/app/blocks-provider";
import { Row, Segmented } from "./row";

export function Interruptions() {
  const { restMinutes, setRestMinutes, checkInMinutes, setCheckInMinutes } = useBlocks();

  // read after mount — localStorage during render makes the server and the
  // client disagree, and React reports that as a hydration mismatch
  const [sound, setSound] = useState(true);
  useEffect(() => setSound(soundOn()), []);

  return (
    <section className="flex flex-col">
      <Row
        label="Sound"
        hint="A small sound when you lock in, finish a task, or finish a block."
      >
        <Segmented
          label="Sound"
          value={sound ? "on" : "off"}
          options={[
            { value: "on", label: "On" },
            { value: "off", label: "Off" },
          ]}
          onChange={(v) => {
            const on = v === "on";
            setSound(on);
            setSoundOn(on);
          }}
        />
      </Row>

      <Row
        label="Rest between blocks"
        hint="How long Milo waits before it says the break is over."
      >
        <Segmented
          label="Rest between blocks"
          value={restMinutes}
          options={[
            { value: 0, label: "Never" },
            { value: 5, label: "5 min" },
            { value: 10, label: "10 min" },
            { value: 15, label: "15 min" },
          ]}
          onChange={setRestMinutes}
        />
      </Row>

      <Row
        label="Check in while a block runs"
        hint="Says how long you've been in it. Never says anything else."
      >
        <Segmented
          label="Check in while a block runs"
          value={checkInMinutes}
          options={[
            { value: 0, label: "Never" },
            { value: 30, label: "30 min" },
            { value: 60, label: "1 hour" },
            { value: 90, label: "1½ hours" },
            { value: 120, label: "2 hours" },
          ]}
          onChange={setCheckInMinutes}
        />
      </Row>
    </section>
  );
}
