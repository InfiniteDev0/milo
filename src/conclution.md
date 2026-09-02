Read everything — all 8 landing sections, both Milo face engines, the pose data, pricing, globals, git history, plus the three docs. Here's my honest take.

The concept is good, and one part of it is genuinely differentiated
Life Blocks is not "another task list." Three mechanics in PRODUCT.md are the actual product:

One block ongoing at a time, switching auto-pauses — this is a real constraint with a real feeling attached. Nobody else enforces it.
Every task has a reason — one field, and it changes what the app is about.
Monthly keep-or-swap — the app has a rhythm instead of an infinite backlog.
Everything else (kanban, timebox, habits, streaks) is table stakes — Sunsama, Amie, Structured, TickTick all have it. So when you're deciding what to build and what to put on the page, those three are the ones that earn the pitch. landingnotes.md already knows this (cards 02/03/04/10 "should never be below the fold") — that judgment is right.

The Duolingo tension — this is the real question
Duolingo's fun is not the owl. Duo's engine is loss aversion: streak freezes, guilt-trip notifications, hearts, leaderboards. That is precisely what PRODUCT.md line 12 and your "Explicitly rejected" list ban. So "Duolingo-level fun" can't mean Duolingo's retention engine, or Milo stops being Milo.

What does transfer, guilt-free:

A character that reacts to state. You already have this, and it's better built than most. More below.
Micro-feedback on every interaction. Duolingo makes tapping a single word feel good — squash, sound, weight. That's craft, not coercion, and it's completely compatible with calm.
A session with a finish line. This is the insight none of your docs have written down yet: a Life Block is a Duolingo lesson. Start → a small set of tasks → an end → a completion moment. Duolingo's lesson-complete screen is the entire dopamine engine. Milo's block-complete moment is currently unspecified — and it's the single highest-value thing in the whole product. That's where the fun budget goes.
Visible progression. The year view can be Duolingo's path — but descriptive ("here's what your year was made of"), never prescriptive.
What must not come over: streak zero-states, leaderboards, hearts, "you're falling behind" pushes.

And you have a live contradiction right now. The hero tooltip says "No rigid streaks or daily shame" — while life-blocks.jsx puts a 🔥 flame streak count on every block card, and PRODUCT.md lists streak as a block field. Also landingnotes.md leaves "what happens when a streak breaks" as an open question. Answer it now, because the answer determines whether the flame is warmth or a threat. My recommendation: the number just shows what it currently is, resets quietly, no sad state, and reflection reports what you actually did. If you can't commit to that, drop streaks from blocks entirely and keep them only on habits.

MiloFace is the best thing in this repo
Real assessment of MiloFace.jsx: shared vertex budget across all poses so they morph instead of snapping, Catmull-Rom → cubic bezier, per-frame pupil refit against the live sclera bounds (so the pupil can't slide off an eye that changed shape mid-morph), gaze tracking saturating over a third of the viewport, blink as a vertical squash about the eye's own center, scroll-position-driven mood, poke → cheer, sleepy after idle, prefers-reduced-motion respected. That's craft. It's the one thing on your landing page a competitor can't clone in an afternoon.

And it's currently doing about 5% of its job — it's a logo and two decorations. Milo belongs inside the app: reacting when a block starts, when a task lands, when the rest timer fires, at end-of-day reflection. That's your Duolingo answer, and it doesn't violate the philosophy, because a companion's reaction is warmth, whereas a streak's threat is coercion.

One note: milo-reaction.jsx duplicates ~200 lines of geometry and a second POSES table. The comment says that's deliberate isolation, which is fine today — but the moment the face goes into the app, it needs to be one engine + one pose registry or the moods will drift.

The landing page — what's wrong right now
process.jsx is still the Framer template. "Create your workspace and invite your team", "Assign tasks and keep communication clear", "Everyone stays aligned" — that's a team-collab product, not a personal one. Plus three hotlinked framerusercontent.com images. This is the loudest wrong note on the page. The replacement is obvious and free: Plan → Live → Pause → Reflect → Adapt, the loop from CLAUDE.md line 8 that appears nowhere on the site.
features.jsx: 12 dashed "Add image" slots labeled Feature 01–12. Shipping that would be worse than having no section. Your own notes reached this — I'd go further than 9: ship 6 cards with the real captions from your table (01, 02, 03, 04, 05, 10) and grow it.
pricing/page.js contradicts the spec twice. "AI Assistant" is a Pro feature — your notes explicitly reject AI. "iPhone, iPad & web" — there is no mobile app and it's last in the platform order. Calendar integration is on the rejected list and it's a Pro bullet. Don't sell rejected features.
Dead nav: /features and /about both render <div />. They're in the navbar and footer.
The strawman: "Other apps: You failed your productivity goal" — no app actually says that. Sharper if it's what they really do: "3 overdue. 12 overdue. 47 overdue."
Hero right side is static. It's the one place the product should demo itself. A pokable mini-block where you can actually hit Start and watch it run beats any screenshot — and it's on-brand fun.
Font setup is tangled in layout.js: Outfit is assigned --font-Albert-sans and Albert_Sans gets --font-Albert-mono (swapped), then globals.css ignores both variables and hardcodes font-family: 'Outfit' / 'Albert sans' off a Google Fonts @import — so both fonts load twice, and 'outfit' (lowercase) on p/span/a may not resolve. Also bg-[] on <html> is an empty arbitrary value, and user-select: none on body kills text selection across the whole marketing site.
#5e17eb is hardcoded in ~12 places and should be a token — it's also a fairly high-energy purple fighting the "calm, warm" claim that the cream #f4f2ee is carrying.
The docs are describing a different project
web/CLAUDE.md says: TypeScript, shadcn Nova, Manrope/Cooper Black/Dancing Script, /auth route with login/signup forms, a Flutter app in lib/, shared assets/. None of that exists. Reality: JavaScript, Base UI, Outfit/Albert Sans, no auth, no Flutter, no assets dir, and a purple brand color that appears in no document. Any session that reads that file starts from a false map — including me next time. Rewriting it is the highest-leverage 20 minutes in this project.

If we're doing this together, here's the order I'd go
Rewrite web/CLAUDE.md to match reality + fold the three new decisions from landingnotes.md into PRODUCT.md, and answer the broken-streak question.
Replace the Process section with Plan → Live → Pause → Reflect → Adapt (kills the team-collab copy and the Framer hotlinks in one move).
Cut features to 6 real cards, fix the dead /features + /about routes, align pricing with the spec.
Make the hero block demo interactive — first place fun shows up.
Then the app shell, and design the block-completion moment as a first-class thing with Milo in it. That's the product's actual heart.
Want me to start at 1, or jump straight to the Process section since it's the most visibly wrong?