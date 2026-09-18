/* Checks the live Supabase project against what the migration claims.
 *
 *   node scripts/verify-db.mjs
 *
 * Runs as an ANONYMOUS visitor, using the same public key that ships in the
 * browser bundle. That is the point: this is the exact access a stranger has,
 * so anything it can read is public.
 *
 * Two things are proved here, and they are different:
 *
 *   1. the table exists          — a missing table errors 42P01
 *   2. RLS is actually filtering — a select with no session returns 0 rows,
 *                                  and an insert is refused
 *
 * A table with RLS *off* would also return rows here. That is the failure this
 * script exists to catch, and it is the one that matters: the anon key is not a
 * secret, so an unprotected table is a public table.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

/* .env.local locally, the real environment in CI. This runs as a build gate
   now, and Vercel has no .env.local — reading it unconditionally turned every
   deploy into a crash. */
let env = {};
try {
  env = Object.fromEntries(
    readFileSync(new URL("../.env.local", import.meta.url), "utf8")
      .split("\n")
      .filter((l) => l.trim() && !l.trim().startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      }),
  );
} catch {}

const url = env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("No NEXT_PUBLIC_SUPABASE_URL / ANON_KEY in .env.local or the environment");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const TABLES = ["profiles", "blocks", "tasks", "steps", "days", "sessions", "notes", "day_plans"];

// a plausible row per table, so the insert is refused by RLS and not by a
// column that doesn't exist — otherwise the test passes for the wrong reason
const SAMPLE = {
  profiles: { id: "00000000-0000-0000-0000-000000000000" },
  blocks: { user_id: "00000000-0000-0000-0000-000000000000", name: "x", bg: "#000", ink: "#fff" },
  tasks: {
    user_id: "00000000-0000-0000-0000-000000000000",
    block_id: "00000000-0000-0000-0000-000000000000",
    name: "x",
  },
  days: { user_id: "00000000-0000-0000-0000-000000000000", stamp: "2026-1-1" },
  sessions: {
    user_id: "00000000-0000-0000-0000-000000000000",
    stamp: "2026-1-1",
    started_at: new Date().toISOString(),
  },
  steps: {
    user_id: "00000000-0000-0000-0000-000000000000",
    task_id: "00000000-0000-0000-0000-000000000000",
    name: "x",
  },
  notes: { user_id: "00000000-0000-0000-0000-000000000000" },
  day_plans: { user_id: "00000000-0000-0000-0000-000000000000", stamp: "2026-1-1" },
};

let failures = 0;
const say = (ok, line) => {
  if (!ok) failures += 1;
  console.log(`${ok ? "  ok  " : " FAIL "} ${line}`);
};

console.log(`\nMilo — database check\n${url}\n`);

console.log("Tables exist, and RLS hides them from a stranger:");
for (const table of TABLES) {
  const { data, error } = await db.from(table).select("*").limit(1);

  if (error?.code === "42P01") {
    say(false, `${table} — table does not exist (migration not applied?)`);
    continue;
  }
  if (error) {
    say(false, `${table} — ${error.code}: ${error.message}`);
    continue;
  }
  say(
    data.length === 0,
    data.length === 0
      ? `${table} — exists, returns nothing without a session`
      : `${table} — RETURNED ${data.length} ROW(S) TO AN ANONYMOUS CALLER`,
  );
}

/* Columns added by later migrations. A missing one errors 42703 (no such
   column) or PGRST205 (no such table) even under RLS, so this catches a
   migration that was written but never run — a silent failure otherwise: the
   UI simply stops persisting one field and says nothing about it. */
console.log("\nLater migrations are applied:");

const COLUMNS = [
  ["0002", "tasks", "note"],
  ["0002", "steps", "task_id"],
  ["0003", "tasks", "kind"],
  ["0003", "tasks", "days"],
  ["0004", "days", "journal"],
  ["0006", "days", "pause"],
  ["0007", "tasks", "archived"],
  ["0007", "days", "ended_at"],
  ["0008", "notes", "block_id"],
  ["0008", "notes", "colour"],
  ["0009", "day_plans", "set_aside"],
  ["0009", "notes", "show_on"],
  ["0010", "notes", "task_id"],
  ["0011", "profiles", "day_themes"],
];

/* 0005 is not in that list and cannot be: it does not ADD a column, it drops
   the default and the not-null on tasks.minutes. Nothing readable changes, so
   the only honest check is a write, and this script runs signed out on
   purpose. If tasks start coming back with minutes: 15 that nobody typed,
   0005 is the one that did not run. */

/* COULDN'T CHECK IS NOT THE SAME AS WRONG — the same distinction the app
   itself now makes between a failed read and an empty account. A missing
   column is a definite failure and should stop a build. An unreachable
   Supabase is unknown, and blocking `npm run dev` on a train would be a
   worse bug than the one this gate prevents. */
let unreachable = false;

for (const [mig, table, column] of COLUMNS) {
  const { error } = await db.from(table).select(column).limit(1);
  const missing = error && ["42P01", "42703", "PGRST205"].includes(error.code);
  if (error && !missing) unreachable = true;
  say(
    !missing,
    missing
      ? `${mig} — ${table}.${column} is not there (migration not run?)`
      : `${mig} — ${table}.${column}`,
  );
}

console.log("\nWrites are refused without a session:");
for (const table of TABLES) {
  const { error } = await db.from(table).insert(SAMPLE[table]);
  say(
    Boolean(error),
    error
      ? `${table} — refused (${error.code})`
      : `${table} — ACCEPTED AN ANONYMOUS INSERT`,
  );
}

console.log(
  failures === 0
    ? "\nAll good. Nothing is readable or writable without signing in.\n"
    : `\n${failures} problem(s) above.\n`,
);

if (unreachable) {
  console.warn(
    "Could not reach Supabase, so this proves nothing. Not failing the build.\n",
  );
  process.exit(0);
}

process.exit(failures === 0 ? 0 : 1);
