-- Milo — a day task can repeat on a rule of your own, and can have a time of day
--
-- Run in the Supabase SQL editor after 0019. The editor may warn about "drop
-- constraint": that is the list of allowed repeats being replaced by the same
-- list plus 'custom'. No data is touched.

-- 'custom' joins the repeats, with its rule beside it:
-- { "every": 2, "unit": "week", "days": [1, 4] }   every 2 weeks, on Mon and Thu
-- unit is day | week | month | year; days (0 = Sunday) only for weeks
alter table public.day_tasks drop constraint if exists day_tasks_repeat_check;
alter table public.day_tasks
  add constraint day_tasks_repeat_check
  check (repeat in ('none', 'daily', 'weekdays', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom'));

alter table public.day_tasks
  add column repeat_rule jsonb,
  -- a time of day, "09:30". Optional, as every start time in Milo is (CLAUDE.md:
  -- "Morning" is a complete answer); nothing reads it to call a task late
  add column at_time text check (at_time is null or at_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
