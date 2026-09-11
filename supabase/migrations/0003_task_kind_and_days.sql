-- Milo — a task's kind, and the days it appears
--
-- This is the whole of what a Project Tracker, a Study tracker and a Content
-- Studio were doing. See SYSTEM.md §3b.
--
-- Backed twice: a weekday assignment is an implementation intention (Gollwitzer
-- & Sheeran 2006, d = 0.65), and rotating a topic across days is the spacing
-- effect. Neither needs a page — they need two columns.

-- ────────────────────────────────────────────────────────────────── kind ──
-- routine — part of the block. Comes back every day it is scheduled for.
-- once    — done is done. It leaves the block and does not return tomorrow.
--
-- Without this, finishing a 17-day project puts it back on the board the next
-- morning, which is the app forgetting something you will not forget.

alter table public.tasks
  add column kind text not null default 'routine'
  check (kind in ('routine', 'once'));

-- ────────────────────────────────────────────────────────────────── days ──
-- Which weekdays this task appears on. EMPTY MEANS EVERY DAY — the default, so
-- the feature is invisible to anyone who never reaches for it.
--
-- Stored as lowercase three-letter names rather than numbers: 0 is Sunday in
-- JavaScript and Monday in half the world, and a silent off-by-one here would
-- put someone's whole week on the wrong days.

alter table public.tasks
  add column days text[] not null default '{}';

alter table public.tasks
  add constraint tasks_days_valid
  check (days <@ array['mon','tue','wed','thu','fri','sat','sun']);

-- Nothing here gets a deadline, a priority or a percentage. See SYSTEM.md for
-- the list of columns that were on the boards this replaces and why each one is
-- refused.
