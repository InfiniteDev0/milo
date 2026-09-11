"use client";

/* Settings.
 *
 * Three of the four things here are POSITIONING commitment 9 made real: the
 * user sets how often Milo speaks, INCLUDING NEVER. Every one of them can be
 * turned off, and turning one off is a complete answer that produces no warning
 * and no consequence.
 *
 * The fourth is signing out, which had no home anywhere in the app.
 */

import { useEffect, useState } from "react";
import { Archive, LogOut, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shade } from "@/lib/shade";
import { DeleteBlock } from "@/components/app/delete-block";
import { setSoundOn, soundOn } from "@/lib/sound";
import { signOut } from "@/lib/auth";
import { useBlocks } from "@/components/app/blocks-provider";

/* "Never" is a first-class option, not the absence of one. It sits in the row
   with the others so choosing it is a choice rather than a refusal. */
function Choice({ label, hint, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-2 border-t border-black/5 py-5 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm">{label}</span>
        {hint && <span className="text-xs text-black/40">{hint}</span>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-colors ${
              value === o.value
                ? "bg-foreground text-white"
                : "text-black/45 ring-1 ring-black/10 hover:text-black/80"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { restMinutes, setRestMinutes, checkInMinutes, setCheckInMinutes, blocks: liveBlocks, archiveBlock } =
    useBlocks();

  // read after mount — localStorage during render makes the server and the
  // client disagree, and React reports that as a hydration mismatch
  const [sound, setSound] = useState(true);
  useEffect(() => setSound(soundOn()), []);

  const [leaving, setLeaving] = useState(false);

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col px-8 pt-6">
      <h1 className="shrink-0 pb-6 text-2xl uppercase">Settings</h1>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8">
        <Choice
          label="Sound"
          hint="A small sound when you lock in, finish a task, or finish a block."
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

        <Choice
          label="Rest between blocks"
          hint="How long Milo waits before it says the break is over."
          value={restMinutes}
          options={[
            { value: 0, label: "Never" },
            { value: 5, label: "5 min" },
            { value: 10, label: "10 min" },
            { value: 15, label: "15 min" },
          ]}
          onChange={setRestMinutes}
        />

        <Choice
          label="Check in while a block runs"
          hint="Says how long you've been in it. Never says anything else."
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

        {/* Last on the page, and the only place a block can actually be lost.
            Setting one aside is the answer almost every time — it keeps the
            tasks and the name, and comes back in one click. */}
        {liveBlocks.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-black/5 py-5">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm">Blocks</span>
              <span className="text-xs text-black/40">
                Setting one aside keeps it and its tasks — it comes back from
                the archive in one click. Removing one does not.
              </span>
            </div>

            {liveBlocks.map((b) => (
              <div key={b.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="rounded-lg px-2.5 py-1 text-xs"
                    style={{ background: b.bg, color: b.ink }}
                  >
                    {b.name.replace(" Block", "")}
                  </span>

                  {/* The safe option stands next to the dangerous one, or this
                      section teaches that deleting is how you remove a block. */}
                  <button
                    type="button"
                    onClick={() => archiveBlock(b.id)}
                    className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-black/10 px-2.5 py-1 text-xs text-black/50 transition-colors hover:text-black"
                  >
                    <Archive className="size-3.5" />
                    Set aside
                  </button>
                </div>
                <DeleteBlock block={b} />
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2 border-t border-black/5 py-5">
          <span className="text-sm">Account</span>

          <Button
            type="button"
            disabled={leaving}
            onClick={async () => {
              setLeaving(true);
              try {
                await signOut();
                window.location.href = "/auth";
              } catch {
                setLeaving(false);
              }
            }}
            className="milo-lift h-10 w-fit cursor-pointer gap-2 rounded-xl border-0 bg-[#262626] font-normal text-white hover:bg-[#303030] disabled:shadow-none"
            style={{ "--lift": shade("#262626", 0.72) }}
          >
            <LogOut className="size-4" />
            {leaving ? "Signing out…" : "Sign out"}
          </Button>

          {/* Says what it costs, which is nothing. Signing out of a planner
              should not feel like a decision. */}
          <span className="text-xs text-black/35">
            Your day is saved. Everything is here when you come back.
          </span>
        </div>
      </div>
    </div>
  );
}
