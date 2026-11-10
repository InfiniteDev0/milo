-- Milo — a cover picture for a category: the banner across the top of its page.
--
-- Run in the Supabase SQL editor after 0020. Like a note's cover (0015) it's a
-- data URI (WebP, shrunk to 1600px in the browser) until Storage exists.
-- cover_y is where the picture sits in the band (Reposition): 0 shows its top,
-- 100 its bottom. Safe to run again: each step checks first.

alter table public.categories add column if not exists cover text;
alter table public.categories add column if not exists cover_y smallint not null default 50;

alter table public.categories drop constraint if exists categories_cover_small;
alter table public.categories
  add constraint categories_cover_small check (cover is null or octet_length(cover) <= 1572864);
alter table public.categories drop constraint if exists categories_cover_y_range;
alter table public.categories
  add constraint categories_cover_y_range check (cover_y between 0 and 100);
