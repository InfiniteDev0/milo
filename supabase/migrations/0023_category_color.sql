-- Milo — a colour you pick for a category, for its label on tasks.
--
-- Run in the Supabase SQL editor after 0022. Null means the colour it gets on
-- its own (picked from its id, so always the same one). Safe to run again.

alter table public.categories add column if not exists color text;

alter table public.categories drop constraint if exists categories_color_hex;
alter table public.categories
  add constraint categories_color_hex check (color is null or color ~ '^#[0-9a-f]{6}$');
