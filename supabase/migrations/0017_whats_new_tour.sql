-- Milo — how far someone is through the "What's new" steps
--
-- Run in the Supabase SQL editor after 0016. One column on your own profile
-- (already yours under its policy); nothing is dropped or deleted.
--
-- { "version": "nov-2026", "done": ["switch-view", ...], "closed": false }
-- A new set of steps gets a new version, so it shows again for everyone.

alter table public.profiles
  add column tour jsonb not null default '{}';
