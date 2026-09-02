# Milo — Landing page features section

Decisions for the `/` landing page's features grid. Reference format: a 3-column grid of
rounded image slots with a short caption under each ("Simple, but powerful" heading, 12
cards). Derived from PRODUCT.md and CLAUDE.md — every card below maps to something in the
spec, except the three flagged as NEW.

## The 12 cards

| # | Caption | Image shows | Status |
|---|---|---|---|
| 01 | Your day in blocks | Daily view — Morning / Deep Work / Wind Down stacked, category badges, times | spec'd |
| 02 | Every task has a reason | Task detail with the *reason for doing it* field filled in | spec'd |
| 03 | One block at a time | A block marked ongoing, the rest dimmed | spec'd |
| 04 | Nothing gets lost when you switch | Tasks auto-paused after skipping a block | spec'd |
| 05 | One board, all your blocks | Kanban: To Do / In Progress / Done, cards pooled from every active block | spec'd |
| 06 | Timebox the rest of your day | The bottom timebox strip | spec'd |
| 07 | Rest is part of the plan | Rest-period timer + nudge, with the check-in frequency control | spec'd + NEW control |
| 08 | Where you are, right now | Live day progress — blocks done, tasks done, focus time | NEW |
| 09 | Save a block, reuse it any day | Block template library, dropping a saved block into today | NEW |
| 10 | Planned 8. Completed 6. | Reflection card, verbatim from spec, plus Focus: 2h 14m | spec'd |
| 11 | Habits survive the reshuffle | Habits page with streaks, next to a month-swap screen | spec'd |
| 12 | Your year, rolled up | Year view by category — Learning, Self-growth, Health, Habits, Work | spec'd |

**Bench** (swap in if a card above gets cut, or if the grid grows):
- *Keep the month or change it* — month-end keep-or-swap screen
- *Notes that stay live* — a note with an embedded tasks/focus-time widget
- *A block, broken down* — total time, task count, times completed, streak

## The three new product decisions

These are net-new and need folding into PRODUCT.md before they're built:

1. **Live day progress.** A card showing blocks done / tasks done / focus time *during* the
   day, not only at reflection. Descriptive, never prescriptive — it says where you are, it
   does not say you're behind. Plausible occupant of the Daily view's right-hand column,
   whose purpose PRODUCT.md currently leaves undecided.
2. **Check-in frequency control.** The rest-period nudge is already spec'd; what's new is
   letting the user set how often Milo checks in. Makes the calm claim concrete instead of
   decorative.
3. **Saved blocks.** "Repeat a block" exists per-day. This is the level above: a library of
   block templates you drop into any day. Morning and Deep Work recur constantly and
   re-entering them is friction. Also a plausible answer for what **Library** is, currently
   an unspec'd sidebar item.

## Explicitly rejected

- **Badges / gamification.** Streaks are spec'd and stay. Badges, "highest streak," and
  loss-aversion mechanics are guilt with a friendly face — PRODUCT.md line 12 rules them
  out. **Open question that still needs an answer:** what a Milo streak does when it
  breaks. If it shows a 0 and a sad state, the rejected mechanic came in anyway. Intended
  behaviour: it quietly resets and the reflection card still reports what you actually did.
- **An AI that generates or optimizes your day.** The user already decided their blocks;
  there's no computation to do on their behalf. "Customized daily plan" means *your day is
  already built from the blocks you set this month* — not a plan generator.
- **Library and Projects as landing cards.** Both are sidebar items with zero spec. Putting
  them on the page commits publicly to undecided features.
- **AI reasoning, health/calendar integrations, location, home/lock-screen widgets.** No AI,
  local-first, web-first. Nothing to screenshot.

## Reality check before shipping

Only the daily board, kanban, onboarding wizard and streak badge can be screenshotted
today. Cards 08–12 map to build steps 5–7 and are the last things that will exist.

Two options: ship 6 cards and grow the grid, or mock up the rest — but mock only what's
genuinely next in the build order, so the mockups become real screenshots instead of
staying promises.

**Also:** 12 dashed placeholders is a lot. A 3-column grid reads fine at 9. If trimming,
cut from the bottom of the table, not the top — cards 02, 03, 04 and 10 are the ones that
distinguish Milo from every other planner and should never be below the fold.
