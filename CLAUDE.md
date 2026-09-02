# Milo — Project Context

This file is a full snapshot of the Milo project for anyone (human or AI) picking it up
cold — it was written to be pasted into a fresh Claude conversation for context.

## What Milo is

Milo is a calm, personal productivity app built around a **Plan → Live → Pause → Reflect →
Adapt** loop. The core product philosophy, set early and non-negotiable:

- No guilt, shame, or aggressive productivity mechanics. Never "You failed your goal" —
  always "You showed up for 6 things today. Nice work."
- The point is to help users organize their lives, not optimize every second of them.
- Calm, warm, premium visual feel. Not another bloated productivity app.

**Tagline used on the landing page:** "Manage your life in blocks."

## Repo layout

```
Milo/
├── lib/            Flutter app — mobile, currently paused in favor of web-first work
├── web/            Next.js app — the actual current focus
├── assets/         Shared brand assets (images + fonts), source of truth for both platforms
└── CLAUDE.md        This file
```

## Why two frontends

The project started as Flutter-only. Mid-build, the user decided: **web becomes a real
Next.js + shadcn/ui app** (not Flutter web) because they wanted pixel-accurate control
using shadcn components directly, and **Flutter is paused, mobile-only, for later**. The
`web/` folder used to hold Flutter's auto-generated web scaffold; that was deleted and
replaced with a real Next.js app in place.

Both platforms are being built to the same visual spec in parallel (the user or another
session has been hand-editing Flutter's onboarding/auth screens to mirror the web ones —
see `lib/features/onboarding/presentation/screens/login_screen.dart` and
`signup_screen.dart`, which now match the web auth forms field-for-field).

## Product spec (the full brief, as given)

### Onboarding flow
Signup (currently just email/password UI, no real backend) → confirm/pick a start date →
land on the dashboard, blurred, with a modal wizard on top: **Welcome** → name the year +
pick an icon → yearly goals (free text) → **Year Vision Board** (flat list of task names,
no categories yet — upgrading this to a Notion-style table with custom properties is an
explicitly deferred feature) → name the month + icon → wizard dismisses, dashboard clears.

### Dashboard shell (not built yet — only applies to the "Daily" sub-tab; every other
sidebar destination should be an empty stub page for now)
- Collapsible sidebar: "Milo" wordmark → divider → expandable **Daily** nav (reveals
  Monthly/Yearly) → Habits → Library → Projects → Idea Dump → pinned at bottom: Settings,
  Help, Trash, avatar.
- Content area splits on an 8-column grid: sidebar = 2, center = 4, right = 2 (right
  column's purpose still undefined, reserved).
- Center column splits vertically 6 units: top 4/6 = Kanban (columns are **task status**:
  To Do / In Progress / Done — cards pulled from all of today's active Life Blocks
  together, confirmed via user decision), bottom 2/6 = timebox view.

### Life Block (redefined per month — a month can keep or swap last month's blocks)
Fields: name, category badge, total time (derived from its tasks), start time, editable
status badge (Notion-style select), times completed, streak, task count. Can be skipped or
repeated.

**Confirmed constraint:** only **one Life Block can be "ongoing" at a time** across the
whole day. Skipping/switching away from a block **pauses its tasks** automatically. (This
supersedes an earlier guess that the one-task-in-progress rule was per-block or global —
it's actually at the block level.)

### Task (inside a block)
name, category/status property, reason/note, duration, status (To Do/In Progress/Done), a
rest-period timer with a productivity-nudge notification.

### Habits
A separate top-level entity, not nested in blocks. Own schedule + streak, survives Life
Block swaps month to month. Stub page for now, like the other non-Daily tabs.

### Year view
Rolls the year's blocks up into categories (Learning, Self-growth, Health, Habits, Work) so
the user can decide at month-end whether to keep or swap a block.

## Build order decided so far

1. ✅ Flutter foundation (theme, router, Riverpod, Hive) + Today/Tasks MVP
2. ✅ Onboarding wizard (Flutter)
3. 🔄 **Currently here:** Auth UI (signup/login) on both platforms, web landing page
4. ⬜ App shell (sidebar + kanban + timebox) — explicitly deferred until after auth/landing
5. ⬜ Life Blocks + Tasks data model and UI
6. ⬜ Habits
7. ⬜ Reflection loop
8. ⬜ Notes + Smart Widgets
9. ⬜ Cloud sync / real authentication (everything up to now is local-first, no backend)
10. ⬜ Polish + beta

The user's own stated anti-pattern to avoid: don't let Claude invent product decisions —
"Does this support Milo's product philosophy and MVP? If not, kill it."

## Web app (`web/`) — the current focus

**Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4,
shadcn/ui (Radix base, "Nova" preset — chosen explicitly to avoid the newer Base UI
default), sonner for toasts, next/font/local for custom fonts.

**Routes:**
- `/` — landing page (Granola-inspired: floating pill navbar, hero headline, CTA buttons).
  Mid-build; the user said they have a **Framer** design they want followed instead and
  will share screenshots — the Granola-style version may get replaced.
- `/auth` — login/signup, toggled client-side via `AuthForms` (`mode: "login" | "signup"`).
  Split layout: image left (desktop only), form + logo right. Forms are **UI skeletons —
  no backend wired**; submitting just shows a toast. Social buttons (Apple/Google/Meta) and
  "Forgot password" are all inert placeholders (`toast.info(...)`).

**Key files:**
- `src/lib/fonts.ts` — the three custom font families via `next/font/local`.
- `src/components/forms/{login-form,signup-form,auth-forms}.tsx` — the auth UI.
- `src/components/{Milo-logo,Milo-wordmark,testimonial-card,download-button}.tsx` —
  shared brand widgets.
- `src/components/ui/*` — shadcn primitives (button, card, field, input, label, separator,
  avatar, sonner).

**Fonts (see Brand assets below for source files):**
- Body/UI text → **Manrope** (`--font-sans` / `font-sans`)
- Headings (landing hero, auth card titles) → **Cooper Black** (`--font-heading` /
  `font-heading`)
- Logo wordmark only ("Milo") → **Dancing Script** (`--font-script` / `font-script`), via
  the `<MiloWordmark>` component. Never use this font for body or heading copy.

**Important history/gotchas:**
- A `shadcn@latest init` run needs explicit `-b radix -p nova -t next` flags — the bare
  `-y` flag does *not* skip the newer interactive "component library" and "preset" prompts
  and will silently no-op under a non-interactive shell.
- Partway through scaffolding, files from an unrelated prior project of the user's
  ("Manasik" — a different SaaS product with real backend auth, orgs/workspaces) got
  pasted into `src/app/forms/` and `src/app/auth/page.tsx` as a structural reference (not
  literal content — wrong branding, wrong backend calls, wrong visual design). Those were
  moved to `src/components/forms/`, stripped of Manasik branding/backend calls, and
  rebuilt to match Milo's actual shadcn-based design reference (see Brand assets).
- The testimonial card intentionally does **not** use the real name/handle/photo from the
  magicui tweet-card demo (`@dillionverma`) — fabricating a testimonial attributed to a
  real, identifiable person is not okay. It ships with placeholder copy instead
  (`src/components/testimonial-card.tsx`); swap in a real quote once one exists.

**Target folder structure** — not migrated yet, adopt incrementally ("do it one by one"):
every new file from here on should be placed where it belongs in this tree rather than
where the current ad-hoc structure would put it; existing files move over gradually, not
in one big rewrite.

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # fonts, <Toaster />, html/body only
│   │   ├── globals.css                 # Tailwind v4 @theme tokens (see below)
│   │   │
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx              # floating pill navbar + footer
│   │   │   └── page.tsx                # /
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx              # split: image left, form right
│   │   │   └── auth/page.tsx           # /auth
│   │   │
│   │   └── (app)/
│   │       ├── layout.tsx              # sidebar shell + 8-col grid
│   │       ├── daily/page.tsx          # the only real view for now
│   │       ├── monthly/page.tsx        # stub
│   │       ├── yearly/page.tsx         # stub
│   │       ├── habits/page.tsx         # stub
│   │       ├── library/page.tsx        # stub
│   │       ├── projects/page.tsx       # stub
│   │       ├── ideas/page.tsx          # stub
│   │       └── settings/page.tsx       # stub
│   │
│   ├── features/
│   │   ├── life-blocks/
│   │   │   ├── model.ts                # LifeBlock type + invariants
│   │   │   ├── store.ts                # state, incl. the one-ongoing rule
│   │   │   └── components/
│   │   │       ├── block-badge.tsx
│   │   │       └── block-list.tsx
│   │   ├── tasks/
│   │   │   ├── model.ts                # Task type, TaskStatus union
│   │   │   ├── store.ts
│   │   │   └── components/
│   │   │       ├── task-board.tsx       # the kanban — columns are status
│   │   │       └── task-card.tsx        # block shown as a spine, not a column
│   │   ├── timebox/
│   │   ├── habits/
│   │   ├── onboarding/                 # wizard steps + stage enum
│   │   ├── reflection/
│   │   └── year/
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn output — regenerable, don't hand-edit
│   │   ├── brand/
│   │   │   ├── Milo-logo.tsx
│   │   │   └── Milo-wordmark.tsx       # Dancing Script lives ONLY here
│   │   ├── layout/
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── marketing-nav.tsx
│   │   │   └── marketing-footer.tsx
│   │   └── forms/
│   │       ├── auth-forms.tsx
│   │       ├── login-form.tsx
│   │       └── signup-form.tsx
│   │
│   ├── lib/
│   │   ├── fonts.ts                    # next/font/local, three families
│   │   ├── utils.ts                    # cn()
│   │   └── storage/
│   │       ├── repository.ts           # interface — the seam
│   │       └── local.ts                # IndexedDB impl for now
│   │
│   ├── content/
│   │   └── landing.ts                  # all marketing copy, no JSX
│   │
│   └── hooks/
│
└── public/
    └── brand/                          # auth.png, logo.png, Milo.png, Cover*.png
```

Note the `storage/repository.ts` seam: local (IndexedDB) now, swappable for a real backend
(Firebase — see below) later without touching feature code, same pattern as the Flutter
side's Hive-backed repositories.

## Auth — Firebase (decided, not yet built)

The user does not have a Firebase project yet; walking them through creating one is the
next step before any integration code is written. Scope as agreed:
- **Email/password** first.
- **Google sign-in** later (the UI already has a "Continue with Google" button, currently
  inert — wire it up in a second pass once email/password works).

## Platform plan (updated)

Build order is now: **Next.js web first → desktop app second, built on the web app's
design and logic → mobile app last.** This is a change from the earlier plan (Flutter as
the mobile app, developed in parallel) — Flutter (`lib/`) stays paused; whether desktop
and mobile end up as Flutter, Electron, or something else wrapping the web build hasn't
been decided, only the sequencing has.

## Flutter app (`lib/`) — mobile, paused

**Stack:** Flutter 3.32, Riverpod (`Notifier`/`NotifierProvider`, no codegen), GoRouter
with a Riverpod-aware `redirect`, Hive CE for local storage (chosen over sqflite/Drift
because it works on every platform without native setup — the repository is swappable
later without touching callers).

**Structure:** feature-first (`lib/features/<feature>/{data,logic,presentation}`), adapted
from the folder conventions of an unrelated prior project of the user's ("WatchHub", an
e-commerce app) that was pasted in early on purely as a structural template — its actual
auth/product/cart code was stripped out entirely.

**Built so far:**
- `features/today` + `features/tasks` — the Today screen MVP: add a task, complete a task,
  Hive-persisted.
- `features/onboarding` — the full wizard described above (`OnboardingProfile` model with
  a computed `stage` enum driving `GoRouter`'s redirect), plus `login_screen.dart` /
  `signup_screen.dart` mirroring the web auth design (split image layout, `LabeledField`,
  `SocialAuthButtons`, `TestimonialCard`, black CTA buttons — same placeholder/no-backend
  behavior as web).
- `features/dashboard` — currently just wraps the Today screen with a blur + the
  onboarding wizard modal on top; the real shell (sidebar/kanban/timebox) isn't built.

**Theme:** light mode by default (`themeMode: ThemeMode.light` in `app.dart` — explicitly
requested, don't default to system/dark). Sage-green/warm-ivory calm palette in
`core/constants/app_colors.dart`, Manrope as the default font family.

**Testing gotcha worth knowing:** Flutter widget tests run in a fake-async zone, but
Hive's writes are real disk I/O — a `pumpAndSettle()` after a Hive-backed state change can
hang or silently not observe the write. Fix is `tester.runAsync(() async { ...await the
real work...; await Future.delayed(...); })` followed by a plain `pump()`. See
`test/widget_test.dart` for the working pattern.

## Brand assets (`assets/`)

Shared source of truth for both platforms — copy into `web/public/` or reference via
`Image.asset` in Flutter as needed; don't regenerate art, it already exists here.

- `assets/images/auth.png` — the hero/split-screen background image used on both
  platforms' auth pages.
- `assets/images/Milo.png` — an earlier hand-lettered "Milo" logo image (superseded by the
  Dancing Script text wordmark for most uses now, but still referenced in a couple of
  places).
- `assets/images/logo.png` — the Milo mascot icon (colorful blob character), used next to
  the wordmark in navbars.
- `assets/images/Cover.png`, `Cover1.png`, `Cover2.png` — App Store–style promo covers
  (black / cream / mint variants) showing the "Milo Daily Planner" branding, kanban card
  mockups, and pill badges ("Productive Life", "Kanban blocks", "Good Habits"). Used as
  hero visuals — e.g. `Cover2.png` on the current landing page.
- `assets/images/login.png`, `Register page (2).png` — pixel-reference screenshots for the
  login/signup card designs (shadcn Card-based: labeled fields, black CTA button, "Or
  continue with" divider + Apple/Google/Meta icon buttons on signup only).
- `assets/fonts/Manrope/` — 7 weights (ExtraLight–ExtraBold), body font on both platforms.
- `assets/fonts/DancingScript_Complete/` — the wordmark font (has ready-made woff2 files
  under `.../Fonts/WEB/fonts/`).
- `assets/fonts/cooper-black/COOPBL.TTF` — the single-weight display/heading font.

## Explicit "not yet" list

Don't build these until asked — they're deliberately deferred:
- Real backend / authentication (everything is local-first right now; auth forms are UI
  skeletons that don't submit anywhere)
- Cloud sync
- The app shell (sidebar, kanban, timebox) — next major slice after auth/landing
- Life Blocks / Tasks-within-blocks data model
- Habits functionality
- Notes + Smart Widgets (Tiptap-style block editor)
- Vision board → Notion-style table with custom properties
- Platform-aware routing (desktop-app-download vs. web landing) — the landing page's
  "Download for Windows" button is an inert placeholder for this
