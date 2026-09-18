# Milo — Project Context

A snapshot of where Milo actually is, written to be read cold by a human or a fresh
session. **If something here disagrees with the code, the code wins — fix this file.**

## The documents

| File | What it owns |
|---|---|
| `../PRODUCT.md` | What Milo does. Features, entities, rules, build order. |
| `../POSITIONING.md` | Who it's for and what it promises. The nine commitments. |
| `web/CLAUDE.md` (this) | How it's built. Stack, structure, gotchas, open decisions. |
| `../ROADMAP.md` | The phases, in dependency order, each with a checkable "done when". |
| `../BACKLOG.md` | What's missing. Dead ends, unbuilt flows, deferred plumbing. |
| `../TIME.md` | How time is recorded. The interval log, and the rules that keep it from becoming a scoreboard. |
| `../SYSTEM.md` | Where the mechanics came from — the journal system underneath Milo. Settles several PRODUCT.md open questions. |
| `../RESEARCH.md` | Findings that decided a build, with sources. Read before reopening one. |

Read POSITIONING.md before writing any user-facing copy. It contains a banned-word
list and a no-competitors rule that are not optional.

## What Milo is

A day planner for days that don't go to plan. The promise, verbatim:

> **Milo notices what you did, not what you didn't.**

Your day is four to six **Life Blocks** you shaped yourself. One runs at a time. When
life interrupts you switch, and the block you left pauses exactly where it was. At the
end of the day Milo reports what you did — never what's missing.

**Nothing in Milo is ever overdue. Nothing is ever late. Skipping is not an event.**

That last line is a data-model rule, not a tone of voice. There is no late state to
hide or soften; it does not exist. Anything that would reintroduce one — an overdue
count, a broken-chain graphic, a "you missed 4" — fails review no matter how good it
looks.

## Two tests before building anything

1. Does this support Milo's philosophy and current MVP scope? *(PRODUCT.md)*
2. Would the person in POSITIONING.md feel worse after seeing it?

Fail either and it gets cut. The user's standing instruction: **don't invent product
decisions.** Propose, flag the tradeoff, let them decide.

## Repo layout — the real one

```
Milo/
├── PRODUCT.md
├── POSITIONING.md
└── web/            Next.js app — the only codebase
    ├── CLAUDE.md
    ├── landingnotes.md      decisions for the landing features grid
    ├── milo-faces.html      generated reference sheet of every mascot pose
    └── src/
```

There is **no `lib/` and no `assets/` folder.** Older versions of this file described a
Flutter app and a shared asset directory — that was **Zeke**, an earlier Flutter project
this one grew out of. It was renamed Milo and restarted as a Next.js web app. Flutter is
gone, not paused. Brand assets live in `web/public/`.

## Stack — verified, not aspirational

- **Next.js 16.3.2** (App Router, Turbopack) · **React 19.2.8** · **JavaScript, not
  TypeScript** — `.js` / `.jsx` throughout, no `tsconfig`
- **Tailwind v4** (`@tailwindcss/postcss`), `tw-animate-css`
- **`@base-ui/react`** — Base UI, *not* Radix. `shadcn` is a dependency but components in
  `src/components/ui/` are hand-held, not regenerated
- **motion** (v13) for animation, **lucide-react** for icons
- **Supabase** — Postgres + Auth, via `@supabase/ssr`. Schema and RLS policies in
  `supabase/migrations/0001_init.sql`, already applied. `npm run verify:db` proves
  every table is unreadable and unwritable without a session.
- **Auth is real and wired**: `proxy.ts` refreshes tokens and redirects, the `(app)`
  layout calls `requireUser()`. Always `getUser()`, never `getSession()` — the
  latter trusts the cookie without revalidating it.

**Fonts:** Outfit + Albert Sans via `next/font/google` in `src/app/layout.js`, *and*
again via `@import` at the top of `globals.css`, which also hardcodes
`font-family: 'Outfit'` / `'Albert sans'` on body and headings. The `next/font` variable
names are also swapped (`Outfit` → `--font-Albert-sans`). **The user has explicitly said
to leave the font setup alone.** Don't tidy it.

## Routes

```
src/app/
├── layout.js              html/body, fonts, metadata — NO chrome
├── globals.css            Tailwind v4 + theme tokens
├── (marketing)/
│   ├── layout.js          navbar + pt-24 + footer  ← chrome lives here only
│   ├── page.js            /          landing
│   ├── about/page.js      /about     the brand page — positioning, research, live demo
│   ├── pricing/page.js    /pricing   free / $9.99mo / $99.99yr / $299.99 lifetime
│   └── features/page.js   /features  EMPTY STUB — renders <div />
├── login/page.jsx         /login     renders bare, by design
└── demo/                  scratch routes when a design question needs one
    └── vision/            hand-drawn "windows" vision board mockup (17 Sep) — parked; the Year page stays as built for now
```

Route groups are how chrome is scoped. **Anything that shouldn't have a navbar goes
outside `(marketing)/`** — that's the whole mechanism. The app shell will become
`(app)/` with its own layout.

## The Milo mascot — the best asset in the repo

An SVG face that morphs between hand-drawn poses. It is the one thing here a competitor
can't clone in an afternoon, and it's currently only used for decoration. **It belongs
inside the app** — reacting when a block starts, a task lands, a block completes.

**Two engines, and this is a known problem:**

- `src/components/MiloFace.jsx` + `src/lib/milo-poses.js` — the navbar logo. Eight poses,
  driven by scroll, hover, poke, idle.
- `src/components/milo-reaction.jsx` — self-contained, own copy of the geometry code and
  its own four-pose table. Used by the philosophy cards.

`happy` and `cheer` are currently identical in both, kept in step **by hand**. One engine
and one pose registry is the fix, and it should happen before the face goes into the app.

**How it works:** every pose shares one vertex budget — brow 7, sclera 24, pupil 14,
mouth 16, tongue 14 — which is what lets one morph into another instead of cutting.
Points are converted Catmull-Rom → cubic bezier each frame; the pupil is re-fitted to the
live sclera bounds every frame so it can't slide off an eye that changed shape.

**Scroll ladder** (`MiloFace.jsx`, in `onScroll`) — it only ever gets warmer:

| | pose | scroll |
|---|---|---|
| 01 | content | 0–22% |
| 02 | focused | 22–46% |
| 03 | proud | 46–68% |
| 04 | happy | 68–90% |
| 05 | cheer | 90–100% |

Plus `peek` (fast scroll, >320px jump, 6s cooldown), `sleepy` (12s idle), `happy` on
hover, `cheer` for 1.1s on poke. `idle` exists but is **retired** — it's the anxious
face that used to greet every visitor.

**Gotchas, all of them earned the hard way:**

- `peek` originally fired on a **90px** jump, which is about one mouse-wheel notch, so it
  re-armed constantly and ate the poses either side of it. Hence 320px + cooldown.
- `cheer`'s grin reaches ~364 units below the viewBox. **Don't widen `VIEWBOX` to fit it**
  — that shrinks all eight faces by 15%. The svg carries `overflow: visible` instead.
- Driven `mood` is read through `moodRef`, and `mood` is deliberately **not** in the
  effect's dep array. Putting it back makes the face reset to its start pose on every
  change instead of morphing.
- `web/milo-faces.html` is a generated reference sheet of all twelve poses. Open it in a
  browser. Regenerate from the scratchpad scripts if poses change.

## Copy rules

From POSITIONING.md, enforced on every page:

- **Banned:** productivity, performance, efficiency, optimise, 10x, hustle, consistency,
  discipline, "stay on track", "don't break the chain". These people left another app to
  escape that vocabulary.
- **Never name a competitor** — not in the hero, not on a card, not in a video. Knowing
  what other tools do is a map for building, not the pitch.
- **ADHD** may be named descriptively ("plenty of them have ADHD") but never as a claim
  about what Milo does for a condition. Milo is not a medical or therapeutic product.
- **No invented testimonials or user counts.** There are no users yet. The about page has
  a marked empty slot for the first real review; leave it empty until one exists.

## Decisions made, don't relitigate

- **No app data in localStorage. Ever.** Supabase is the store. It is plaintext and
  readable by any script on the origin, and notes are the most personal thing here.
  Don't add a cache there for speed — use a skeleton.
- **Offline is PowerSync's job**, when it gets set up. Note for whoever does it: the
  web SDK persists SQLite through IndexedDB or OPFS, which are same-origin readable
  exactly like localStorage, and encryption is opt-in (a `sqlite3mc.wasm` build).
  **PowerSync is a sync tool, not a security control** — the XSS answer is CSP.
- **The write path is optimistic**: state changes in memory, `src/lib/db/sync.js`
  queues the write, retries with backoff, and says nothing to the user. An alert
  because a write is three seconds late is the anxiety this app exists to remove.
- **Streaks are off Life Blocks entirely** — habits only, default off, never a loss state.
- **No priority / urgent flag.** Block order decides what comes first.
- **Habits must render a skipped day identically to an unscheduled day.** No chain, no
  grid of misses, no "best streak". *If habits can't be built this way, Milo ships without
  habits.*
- **Start times are optional.** "Morning" is a complete answer.
- **Closing the day ends it; it never resets it** (14 Sep). End day stops the
  clock, saves the Night entry and sets `ended_at`, and the board shows the day's
  reflection until rollover. Resetting onto the same date upserted an empty row
  over the real one — one row per user per date means a closed day and a fresh
  day cannot share a stamp. Only the rollover calls `newDay()`.
- **Notes are not the journal** (14 Sep). A note is something written during the
  day, linked to one block or just to the day (`notes.block_id`, nullable).
  Every note autosaves the moment it is created — there is no Save button and
  nothing is deleted at midnight. The notes sheet shows today's notes; `/notes`
  opens grouped by block (with a Day notes card for the rest) and switches to
  every note as cards. A block's name opens `/notes/[blockId]` (`/notes/day` for
  day notes). Cards: a click opens, the checkbox selects; selected notes can be
  moved or deleted. **Delete is Undo-first**: the note leaves the screen at once
  and the real delete runs only when the ~6s Undo toast closes — so closing the
  tab inside that window keeps the note, never loses it. Saves *and* deletes go
  through `db/note-queue.js`, not `sync.js`: one request per note at a time,
  every save sends the newest version, and a deleted id refuses later saves so
  an in-flight upsert can't bring it back.
  **For now a note lives in a block or in the day.** MVP 2 adds other homes
  outside blocks (a to-do list, something just for fun — categories that are not
  Life Blocks). Keep "where a note lives" decided in the provider and views, not
  baked deeper into what `block_id` means. The unused `notes.category` column
  (default `ideas`) predates all of this.
- **The Day ahead shows one block at a time** (15 Sep). Today or tomorrow: the
  lineup as names only, then a single block's tasks — never the whole day in one
  list, so commitment 7 stands as written. Weekdays still decide what a day
  holds (no dates). "Not today / Not tomorrow" skips a task for that one date,
  and a block can be set aside ahead of time. Plans live in `day_plans`
  (migration `0009`), **never on `days`**: the day row is upserted whole and the
  midnight roll creates the next one, and either would erase a plan stored
  there. Today's plan is applied at load and at the midnight roll; picking a
  set-aside block back up also removes it from the plan, or the next load puts
  it down again. Every "is this task today" check goes through `isToday` from
  the provider. Saves go through `db/plan-queue.js` (newest wins). Notes can
  wait for a day (`notes.show_on`) and then appear in that day's notes.
- **Reflection reports actuals** — "You showed up for 6 things", never "6 of 8".
- Landing `Process` section is the **Plan → Live → Pause → Reflect → Adapt** loop. Its
  three images are still hotlinked from `framerusercontent.com` — replace with real
  screenshots before launch.

## Open decisions

1. **Accent colour.** `#5e17eb` is in use and hardcoded in 36 places across src/. It's chroma 0.269
   — 1.7× more saturated than anything else in the brand including the mascot — and the
   only cold colour in a warm palette. Recommendation on the table: a brand/action pair,
   `#b459cf` (L 62%, big shapes) + `#84279e` (L 47%, buttons and text). See `/demo/color`.
   **Not decided. Ask before changing it.**
2. **The founder story** on `/about` is a `[Your story goes here.]` placeholder. Only
   Abdiaziz can write it.
3. **Landing features grid** — still 12 dashed "Add image" placeholders. `landingnotes.md`
   says cut to 6–9, real captions, best cards first.
4. `/features` and the footer's links point at an empty stub.
5. Social links are placeholder `youtube.com` / `instagram.com` throughout.

## Build order

1. ✅ Landing page, pricing, about
2. ✅ Auth — Supabase, magic link + OAuth, proxy + layout guard
3. ✅ App shell, kanban, block lineup, month calendar, notes editor
4. ✅ Time tracking — the interval log (`TIME.md`)
5. ✅ Database schema + RLS
6. ✅ Every feature on Supabase — blocks, tasks, days, sessions, profile, notes.
7. 🔄 **Here:** writing. Notes are built (migrations up to `0011` must be applied):
   the notes sheet and `/notes` share `NotesProvider`. The journal is being
   specified by Abdiaziz step by step: `/journal` (`components/app/journal/`) is
   **UI only, nothing saved** (17 Sep) — search, the "Your story, kept." hero with
   Start reading, and the shelf illustration (`public/journal.png`) bottom-right.
   Opening a book follows codrops BookPreview/BookBlock, rebuilt in React +
   motion (no jQuery): the shelf cover swings open in 3D, then the open book
   grows in beside an empty right column kept for later. The open book is
   `public/bookui.png` cut out of its white background and split at the spine
   (`public/journal-page-left.webp` / `-right.webp`), so a 3D page turn shows
   the real photo on both faces; a turning leaf is clipped so the stacked page
   edges stay behind. You type onto the pages in Caveat (`journal/paper.js`
   holds the margins and sizes). A full page flows on with the cursor and turns
   the leaf. Pages live in memory only.
   He is guiding the rest; build only what he describes.
8. ⬜ Offline via PowerSync
9. ⬜ The flows in `BACKLOG.md` — partial-day close, month-end swap, block CRUD
10. ⬜ Habits *(or shipping without them — PRODUCT.md allows it)*
11. ⬜ Polish + beta

**Platform order:** web → desktop (built on the web app) → mobile last.

## Working notes

- The user works fast, wants opinions not options, and will say when something's wrong.
  Give a recommendation, not a survey.
- **Show, don't describe.** Every design question in this project has been settled faster
  by building a throwaway route under `/demo/` than by arguing in prose.
- Run `npx next build` after changes — it's fast and catches JSX mistakes immediately.
- **The blocks provider is split** (15 Sep). `blocks-provider.jsx` only wires
  hooks together: state in `components/app/blocks/use-day-state.js`, then one
  hook per behaviour beside it (load, save, midnight, plans, reconcile, task /
  step / block / day actions, setup, filing a day, the value). Pure rules live
  in `src/lib/day/` (work, intervals, history, snapshot). Add a behaviour as its
  own hook; never grow the provider file again. Components still import
  `useBlocks` from `blocks-provider`.
- Keyboard shortcuts are listed once in `src/lib/shortcuts.js` (Settings →
  Shortcuts reads it) and bound with `hooks/use-shortcut.js`.
- **Device settings** (sound-like, never data) go through `lib/preference.js`
  (`createPreference`) and `hooks/use-preference.js`: spelling underlines, the
  notes sheet position, the task timer mode.
- **Built 17 Sep, from the user's own list:**
  - An empty block (nothing today, not started) is out of the day: the provider's
    `dayBlocks` drives the lineup, "day complete", rest and "next". Use it, not
    `blocks`, for anything about today's line.
  - Deleting a task is Undo-first (`components/app/undo-toast.jsx`, shared with
    notes); the real delete runs when the toast closes.
  - Tasks move between blocks (`moveTask`, saved with its own `task-block:` write
    key so a pending note save isn't cancelled). The block sheet has Today · All
    tasks; the Month page is block columns (`components/app/month/`) with drag.
  - A task holds real notes (`notes.task_id`, migration `0010`); the old text box
    shows until "Turn into a note".
  - Weekday themes live on the profile (`profiles.day_themes`, migration `0011`),
    edited in Settings → Week.
  - The task timer is the task's minutes: one nudge when the clock has been on it
    that long (`components/app/task-timer/`). Never a countdown.
  - Both notes sheets (day page and Notes page) float (no backdrop, stay open)
    and share one position: dragged to left / centre / right.
  - A moved task takes its notes along: `moveTask` fires `milo:task-moved` and
    `notes/use-follow-tasks.js` moves notes still filed under the old block
    (a note filed elsewhere on purpose stays put).
  - Before the first block, the board shows a morning card into the Day ahead
    (`day-ahead/morning-card.jsx`); it never opens anything by itself.
  - Images in notes are data URIs, shrunk to 1600px WebP; `Image` needs
    `allowBase64: true` or they vanish on reopen. Storage is the eventual swap.
  - **The Year page** (`components/app/year/`, decided from research — see
    RESEARCH.md "The year page"): what it's about → Achieved (first) → vision
    board → the months you lived → set down. A wish is tied to its blocks and
    shows *days you showed up for it* (never a %); it can be achieved (confetti)
    or set down. `profile.year.vision` may hold plain strings from setup —
    always read it through `readVision`. The month review now keeps each closed
    month's name in `profile.year.months`, and any month card on the Year page
    can be named by hand (`year/month-name.jsx`).
- A pre-existing lint warning on `MiloFace.jsx:271` ("Cannot access refs during render")
  is a false positive on a ref-callback factory. Leave it.
