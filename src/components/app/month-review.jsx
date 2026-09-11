"use client";

/* Starting a month.
 *
 * The wizard runs once, when you have no blocks. This is the other door: every
 * time the calendar turns over, Milo shows you what the month was made of and
 * asks what the next one should be.
 *
 * PRODUCT calls it the reason someone comes back on day 30, and it is the thing
 * that gives Milo a rhythm instead of an endless list — a month is a commitment
 * with an end, and the end is where you get to change your mind.
 *
 * THREE RULES:
 *
 *   1. It reports how many DAYS each block ran. Not how many it didn't, not out
 *      of thirty, not a percentage. A block that ran twice ran twice.
 *
 *   2. Setting a block aside is not deleting it. It goes to the archive and can
 *      come back next month, or any day, in one click.
 *
 *   3. IT DOES NOT BLOCK THE DAY. "Not now" closes it and today runs exactly as
 *      it did. An app that holds your morning hostage on the 1st is an app you
 *      learn to dread opening on the 1st.
 */

import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import MiloFace from "@/components/MiloFace";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconInput } from "@/components/ui/icon-input";
import { shade } from "@/lib/shade";
import { playLock } from "@/lib/sound";
import { useBlocks } from "./blocks-provider";

const ICONS = ["🌙", "🌱", "🔥", "📖", "🧭", "🛠️", "🌊", "☀️", "🏔️", "✍️"];

// the palette new blocks are drawn from, same as the wizard's
const COLOURS = [
  { bg: "#F5C542", ink: "#1a1400" },
  { bg: "#2E5BFF", ink: "#ffffff" },
  { bg: "#5ECBA1", ink: "#04231a" },
  { bg: "#F5836A", ink: "#2b0d05" },
  { bg: "#A78BFA", ink: "#1c0f3d" },
  { bg: "#7FC6F5", ink: "#04202b" },
];

const monthStamp = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}`;
const monthName = (d = new Date()) =>
  d.toLocaleDateString("en-US", { month: "long" });

export function MonthReview() {
  const {
    blocks,
    profile,
    history,
    hydrated,
    completeSetup,
    archiveBlock,
    setProfile,
  } = useBlocks();

  const [open, setOpen] = useState(false);
  const [keep, setKeep] = useState({});
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [draft, setDraft] = useState("");
  const [added, setAdded] = useState([]);

  /* Decided after mount: the month comes from the browser's clock, and reading
     it during render makes the server and the client disagree. */
  const [now, setNow] = useState(null);
  useEffect(() => setNow(new Date()), []);

  useEffect(() => {
    if (!now || !hydrated || blocks.length === 0) return;
    // no stamp at all means this profile predates the field — treat it as current
    const last = profile?.month?.stamp;
    if (last && last !== monthStamp(now)) setOpen(true);
  }, [now, hydrated, blocks.length, profile?.month?.stamp]);

  /* How many days each block actually ran last month. Counts up. There is no
     denominator here and there must never be one. */
  const ranDays = useMemo(() => {
    const counts = {};
    for (const day of history) {
      for (const b of day.blocks ?? []) {
        counts[b.id] = (counts[b.id] ?? 0) + 1;
      }
    }
    return counts;
  }, [history]);

  if (!open || !now) return null;

  const kept = (id) => keep[id] !== false;

  const start = () => {
    playLock();

    blocks.filter((b) => !kept(b.id)).forEach((b) => archiveBlock(b.id));

    if (added.length > 0) {
      completeSetup({
        year: profile?.year,
        month: { name: name.trim() || monthName(now), icon, stamp: monthStamp(now) },
        blocks: added,
        tasksByBlock: {},
        keepExisting: true,
      });
    } else {
      setProfile({
        ...profile,
        month: {
          name: name.trim() || monthName(now),
          icon,
          stamp: monthStamp(now),
        },
      });
    }

    setOpen(false);
  };

  const later = () => {
    /* Stamps the month without changing anything, so it does not ask again
       tomorrow. Deciding not to decide is a decision. */
    setProfile({
      ...profile,
      month: { ...(profile?.month ?? {}), stamp: monthStamp(now) },
    });
    setOpen(false);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && later()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center gap-2 text-center">
          <MiloFace mood="content" instant gaze={false} reactToScroll={false} className="size-16" />
          <DialogTitle className="text-xl">
            {monthName(now)} is here.
          </DialogTitle>
          <p className="text-sm text-black/45">
            Keep what worked, set aside what didn&rsquo;t.
          </p>
        </DialogHeader>

        <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto overscroll-contain">
          {blocks.map((b) => {
            const on = kept(b.id);
            const ran = ranDays[b.id] ?? 0;

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setKeep((k) => ({ ...k, [b.id]: !on }))}
                className={`milo-lift flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-opacity ${
                  on ? "opacity-100" : "opacity-35"
                }`}
                style={{
                  background: b.bg,
                  color: b.ink,
                  "--lift": shade(b.bg, 0.22),
                }}
              >
                <span className="truncate">{b.name.replace(" Block", "")}</span>

                {/* Days it ran. Never "of 30" — a block that ran twice ran
                    twice, and the month has no quota. */}
                <span className="shrink-0 text-xs opacity-70 tabular-nums">
                  {ran > 0
                    ? `${ran} ${ran === 1 ? "day" : "days"}`
                    : on
                      ? "keep"
                      : "set aside"}
                </span>
              </button>
            );
          })}

          {added.map((b, i) => (
            <div
              key={b.id}
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm"
              style={{ background: b.bg, color: b.ink }}
            >
              <span className="truncate">{b.name}</span>
              <button
                type="button"
                onClick={() => setAdded((a) => a.filter((_, j) => j !== i))}
                aria-label={`Remove ${b.name}`}
                className="shrink-0 cursor-pointer opacity-60 hover:opacity-100"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const clean = draft.trim();
            if (!clean) return;
            const c = COLOURS[(blocks.length + added.length) % COLOURS.length];
            setAdded((a) => [...a, { id: crypto.randomUUID(), name: clean, ...c }]);
            setDraft("");
          }}
        >
          <IconInput
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a block for this month…"
            aria-label="Add a block"
            icon={<Plus className="size-4" />}
          />
        </form>

        <div className="flex flex-col gap-2 border-t border-black/5 pt-3">
          <span className="text-xs text-black/45">Name the month</span>
          <IconInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={monthName(now)}
            aria-label="Name this month"
            icon={<span className="text-sm">{icon}</span>}
          />
          <div className="flex flex-wrap gap-1">
            {ICONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setIcon(e)}
                aria-label={`Pick ${e}`}
                className={`flex size-8 cursor-pointer items-center justify-center rounded-lg text-base transition-colors ${
                  icon === e ? "bg-black/10" : "hover:bg-black/5"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={later}
            className="cursor-pointer px-2 text-sm text-black/40 transition-colors hover:text-black"
          >
            Not now
          </button>
          <Button
            type="button"
            onClick={start}
            className="milo-lift h-11 flex-1 rounded-xl border-0 bg-[#262626] font-normal text-white hover:bg-[#303030]"
            style={{ "--lift": shade("#262626", 0.72) }}
          >
            Start {name.trim() || monthName(now)}
          </Button>
        </div>

        <p className="-mt-2 text-center text-xs text-black/30">
          Nothing is deleted. Set aside blocks wait in the archive.
        </p>
      </DialogContent>
    </Dialog>
  );
}
