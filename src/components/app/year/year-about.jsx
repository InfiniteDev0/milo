"use client";

// What this year is about, in your words — editable where it's read.

import { useBlocks } from "../blocks-provider";

export function YearAbout() {
  const { profile, setProfile } = useBlocks();

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm text-foreground/45">What this year is about</h2>
      <textarea
        value={profile?.year?.goals ?? ""}
        onChange={(e) => setProfile((p) => ({ ...p, year: { ...(p?.year ?? {}), goals: e.target.value } }))}
        placeholder="A sentence or two about what you want this year to be."
        aria-label="What this year is about"
        rows={2}
        className="w-full max-w-3xl resize-none bg-transparent text-xl leading-relaxed outline-none [field-sizing:content] placeholder:text-foreground/25"
      />
    </section>
  );
}
