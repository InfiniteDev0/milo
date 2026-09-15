"use client";

/* The day, written down.
 *
 * Two halves, both real: what you wrote at the close of the day (journal.night,
 * the same entry close-day.jsx saves) and what you actually did — the tasks you
 * ticked, pulled straight from today's list.
 *
 * Actuals only. Nothing you didn't get to appears here, which is why the list
 * is of things DONE rather than the block's whole contents.
 */

import { Check } from "lucide-react";
import { useBlocks } from "./blocks-provider";
import { Strike } from "./strike";

const stamp = (d = new Date()) =>
  d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function DailyReflection() {
  const { tasks, journal, isToday } = useBlocks();

  const did = tasks.filter((t) => isToday(t) && t.status === "done");
  const written = journal?.night?.trim();

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto py-6 text-left">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl">Daily Reflection</h2>
        <span className="text-base text-foreground/35">{stamp()}</span>
      </div>

      {written ? (
        <p className="whitespace-pre-wrap text-base leading-relaxed">{written}</p>
      ) : (
        /* An invitation, never a scolding for an empty box. */
        <p className="text-base leading-relaxed text-foreground/35">
          Nothing written yet. Look back on today whenever you feel like it.
        </p>
      )}

      {did.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-base">What I focused on today:</span>

          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {did.map((t) => (
              <li key={t.id} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-white">
                  <Check className="size-3" strokeWidth={3.5} />
                </span>
                <span className="min-w-0 flex-1 break-words text-base text-foreground/55">
                  <Strike done>{t.name}</Strike>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* the day is over, so this is the moment tomorrow can be looked at without it being a demand */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent("milo:day-ahead", { detail: "tomorrow" }))}
        style={{ "--lift": "var(--chrome-lift)" }}
        className="milo-lift mt-auto flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-chrome px-4 py-2.5 text-sm text-chrome-ink"
      >
        See what&rsquo;s waiting tomorrow
      </button>
    </div>
  );
}
