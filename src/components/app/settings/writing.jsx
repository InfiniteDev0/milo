"use client";

// How writing behaves in notes.

import { useSpellcheck } from "@/hooks/use-spellcheck";
import { setSpellcheckOn } from "@/lib/spellcheck";
import { Row, Segmented } from "./row";

export function Writing() {
  const on = useSpellcheck();

  return (
    <section className="flex flex-col">
      <Row
        label="Spelling underlines"
        hint="The red line under words your browser doesn’t know. To keep a single word, right-click it and choose Add to dictionary."
      >
        <Segmented
          label="Spelling underlines"
          value={on ? "on" : "off"}
          options={[
            { value: "on", label: "On" },
            { value: "off", label: "Off" },
          ]}
          onChange={(v) => setSpellcheckOn(v === "on")}
        />
      </Row>
    </section>
  );
}
