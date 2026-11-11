-- Milo — the order you dragged a category's notes and tasks into, on its page.
--
-- Run in the Supabase SQL editor after 0021. One column on the category:
-- { "notes": [note ids], "tasks": [task ids] }, first to last. Anything not in
-- it (new since the last drag) shows first, newest first. Safe to run again.

alter table public.categories add column if not exists item_order jsonb not null default '{}'::jsonb;

alter table public.categories drop constraint if exists categories_item_order_small;
alter table public.categories
  add constraint categories_item_order_small check (octet_length(item_order::text) <= 262144);
