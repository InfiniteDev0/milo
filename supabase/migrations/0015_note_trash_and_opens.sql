-- Milo — note covers, Trash for notes, and when you last opened a note
--
-- Run in the Supabase SQL editor after 0014. Nothing here drops or deletes anything.

-- ──────────────────────────────────────────────────────────────── cover ──
-- A picture across the top of a note's card. Shrunk to 800px WebP before it
-- gets here, like the photos inside notes; the cap stops a full-size one.

alter table public.notes
  add column cover text
  constraint notes_cover_small check (cover is null or octet_length(cover) <= 524288);

-- ──────────────────────────────────────────────────────────────── trash ──
-- Deleting a note now moves it to Trash: it leaves every list but stays in the
-- database until you restore it or delete it forever from the Trash tab. Null
-- means not in Trash. Nothing empties Trash on its own yet.

alter table public.notes
  add column deleted_at timestamptz;

create index notes_trash_idx on public.notes (user_id, deleted_at)
  where deleted_at is not null;

-- ─────────────────────────────────────────────────────────── note opens ──
-- When you last opened each note, for the Recent tab (notes opened today). A
-- table of its own, not a column on notes: saving a note bumps its updated_at
-- (the touch trigger), so stamping the open on the note would make merely
-- reading it count as editing it.

create table public.note_opens (
  note_id    uuid primary key references public.notes (id) on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  opened_at  timestamptz not null default now()
);

create index note_opens_user_idx on public.note_opens (user_id, opened_at desc);

alter table public.note_opens enable row level security;

-- yours, and only for a note that is also yours
create policy "own note opens" on public.note_opens
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.notes n
      where n.id = note_id and n.user_id = auth.uid()
    )
  );
