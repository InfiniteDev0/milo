"use client";

/* The three panels beside the steps.
 *
 * Built from Milo's own leaf components — Tick, TaskRings, the block colours —
 * rather than screenshots. Screenshots go stale the day after you take them,
 * and the images these replaced were hotlinked from someone else's CDN and
 * showed a team product with Messages, Members and Invite. Milo has none.
 *
 * Decorative: pointer-events-none, so nothing here is a control.
 */

import { AtSign } from "lucide-react";
import MiloFace from "@/components/MiloFace";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { IconInput } from "@/components/ui/icon-input";
import { TaskRings } from "@/components/app/task-rings";
import { Tick } from "@/components/app/task-bits";
import { Strike } from "@/components/app/strike";
import { shade } from "@/lib/shade";

const noop = () => {};

function Shell({ children, className = "" }) {
  return (
    <div
      className={`pointer-events-none flex h-full w-full select-none flex-col bg-white ${className}`}
    >
      {children}
    </div>
  );
}

/* The signup screen as it really is — the SAME Field, IconInput and Button
   the page uses, and copy lifted from COPY.signup in forms/auth-form.jsx, so
   the panel and the page cannot say different things. */
export function JoinPanel() {
  return (
    <Shell className="items-center justify-center gap-2 bg-background p-5 text-center">
      <MiloFace
        instant
        gaze={false}
        reactToScroll={false}
        className="size-10 touch-none select-none"
      />

      <h4 className="text-xl">Welcome to Milo</h4>

      <FieldDescription>
        Already have an account?{" "}
        <span className="underline underline-offset-2">Log in</span>
      </FieldDescription>

      <Field className="w-full pt-2 text-left">
        <FieldLabel>Email</FieldLabel>
        <IconInput
          placeholder="Enter your Email"
          icon={<AtSign className="size-4" />}
          readOnly
          tabIndex={-1}
        />
      </Field>

      {/* the real one is disabled until the field has something in it */}
      <Button
        disabled
        tabIndex={-1}
        className="mt-1 h-10 w-full text-md font-normal"
      >
        Create account
      </Button>
    </Shell>
  );
}

/* The lineup, at the size it really is — the block's own colour, its own
   darker shade underneath, and the rings the app draws. */
const BLOCKS = [
  { name: "Morning", bg: "#F5C542", ink: "#1a1400", todo: 2, done: 1 },
  { name: "Deep Work", bg: "#2E5BFF", ink: "#ffffff", todo: 3, done: 0 },
  { name: "Wind Down", bg: "#A78BFA", ink: "#1c0f3d", todo: 2, done: 0 },
];

export function BlocksPanel() {
  return (
    <Shell className="justify-center gap-2.5 p-4">
      {BLOCKS.map((b) => (
        <div
          key={b.name}
          style={{
            background: b.bg,
            color: b.ink,
            "--lift": shade(b.bg, 0.22),
          }}
          className="milo-lift flex h-14 items-center justify-between gap-3 rounded-xl px-3"
        >
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium">{b.name}</span>
            <span className="text-[10px] opacity-60">
              {b.todo + b.done} tasks
              {b.done > 0 && <> · {b.done} done</>}
            </span>
          </div>
          <TaskRings todo={b.todo} done={b.done} className="size-8 shrink-0" />
        </div>
      ))}
    </Shell>
  );
}

/* A block, open. The same header and the same ticks as the block sheet. */
const TASKS = [
  { name: "Draft the spec", done: true },
  { name: "Ship the auth flow", done: true },
  { name: "Review the PR", done: false },
];

export function LivePanel() {
  return (
    <Shell>
      {/* the header bleeds to the edges, exactly as it does in the real sheet */}
      <div
        className="flex shrink-0 flex-col gap-0.5 px-4 py-3"
        style={{ backgroundColor: "#2E5BFF", color: "#ffffff" }}
      >
        <span className="text-sm font-medium">Deep Work</span>
        {/* Actuals only — never "2 of 3". */}
        <span className="text-[10px] opacity-60">
          3 tasks · 2 done · 48m spent
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-2 p-3">
        {TASKS.map((t) => (
          <div
            key={t.name}
            className="flex items-center gap-2 rounded-lg border border-black/10 px-2.5 py-2"
          >
            <Tick done={t.done} onToggle={noop} className="size-4" />
            <span
              className={`min-w-0 flex-1 truncate text-xs ${
                t.done ? "text-black/40" : ""
              }`}
            >
              <Strike done={t.done} className="max-w-full truncate align-top">{t.name}</Strike>
            </span>
          </div>
        ))}
      </div>
    </Shell>
  );
}
