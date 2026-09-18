-- Milo — a theme for a weekday
--
-- "Tuesday is Media day." A name and an emoji per weekday, shown beside the date so the day's main thread is clear
-- before it starts. Weekdays only, like tasks: { "tue": { "name": "Media day", "emoji": "🎬" } }.
--
-- A theme describes the day; it never adds work to it or measures the day against it.

alter table public.profiles
  add column day_themes jsonb not null default '{}'::jsonb;
