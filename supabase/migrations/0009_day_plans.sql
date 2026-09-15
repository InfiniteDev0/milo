-- Milo — a day, prepared before it arrives
--
-- The Day ahead view lets you look at today or tomorrow one block at a time:
-- a task can sit one day out ("Not tomorrow") and a block can be set aside
-- ahead of time. Weekdays still decide what a day holds; a plan only lays
-- choices on top.
--
-- Its own table, not more fields on `days`. The day row is written whole, over
-- and over, while the day runs, and the midnight roll creates the next one — a
-- plan stored there could be overwritten by either. Nothing else writes here.
--
-- Nothing in this file is a deadline. A skipped task is absent that one day,
-- exactly like a task scheduled for other weekdays, and nothing counts it.

create table public.day_plans (
  user_id    uuid not null references auth.users on delete cascade,
  stamp      text not null,                        -- local date, same format as days.stamp
  skipped    jsonb not null default '[]'::jsonb,   -- task ids sitting this one day out
  set_aside  jsonb not null default '[]'::jsonb,   -- block ids set aside ahead of time
  updated_at timestamptz not null default now(),
  primary key (user_id, stamp)
);

alter table public.day_plans enable row level security;

create policy "own day plans" on public.day_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger day_plans_touched before update on public.day_plans
  for each row execute function public.touch_updated_at();

-- A note can wait for a day: left tonight, it shows up in tomorrow's notes.
-- Null for every ordinary note, and after its day it is simply a note again.
alter table public.notes
  add column show_on text;

create index notes_show_on_idx on public.notes (user_id, show_on)
  where show_on is not null;
