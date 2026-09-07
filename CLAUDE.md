# Milo — Project Context

A snapshot of where Milo actually is, written to be read cold by a human or a fresh
session. **If something here disagrees with the code, the code wins — fix this file.**

## The documents

| File | What it owns |
|---|---|
| `../PRODUCT.md` | What Milo does. Features, entities, rules, build order. |
| `../POSITIONING.md` | Who it's for and what it promises. The nine commitments. |
| `web/CLAUDE.md` (this) | How it's built. Stack, structure, gotchas, open decisions. |
| `../BACKLOG.md` | What's missing. Dead ends, unbuilt flows, deferred plumbing. |
| `../TIME.md` | How time is recorded. The interval log, and the rules that keep it from becoming a scoreboard. |

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
- **No backend.** No auth, no database, no persistence of any kind yet

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
└── demo/                  scratch routes, safe to delete
    ├── hero/              interactive hero candidate vs the shipped one
    ├── color/             accent colour candidates — decision still open
    └── faces/             drives MiloFace with a forced mood
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

- **Streaks are off Life Blocks entirely** — habits only, default off, never a loss state.
- **No priority / urgent flag.** Block order decides what comes first.
- **Habits must render a skipped day identically to an unscheduled day.** No chain, no
  grid of misses, no "best streak". *If habits can't be built this way, Milo ships without
  habits.*
- **Start times are optional.** "Morning" is a complete answer.
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
2. 🔄 **Here:** auth screens (`/login` exists with `login-form.jsx`, no backend)
3. ⬜ App shell — sidebar, kanban (columns are status), timebox
4. ⬜ Life Blocks + Tasks, fully wired
5. ⬜ Habits
6. ⬜ Reflection loop
7. ⬜ Notes + Smart Widgets
8. ⬜ Real auth + cloud sync
9. ⬜ Polish + beta

**Platform order:** web → desktop (built on the web app) → mobile last.

## Working notes

- The user works fast, wants opinions not options, and will say when something's wrong.
  Give a recommendation, not a survey.
- **Show, don't describe.** Every design question in this project has been settled faster
  by building a throwaway route under `/demo/` than by arguing in prose.
- Run `npx next build` after changes — it's fast and catches JSX mistakes immediately.
- A pre-existing lint warning on `MiloFace.jsx:271` ("Cannot access refs during render")
  is a false positive on a ref-callback factory. Leave it.
