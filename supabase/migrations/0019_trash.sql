-- Milo — one Trash for everything you delete
--
-- Run in the Supabase SQL editor after 0018. Adds a column to four tables;
-- nothing is dropped or deleted.
--
-- Deleting a task (on a block or a day), a block, or a journal page now moves
-- it to Trash: it leaves every list but stays here until you restore it or
-- delete it for good on the Trash page. Notes have had this since 0015.
-- Null means not in Trash. Nothing empties Trash on its own yet.
--
-- A block in Trash takes its tasks out of sight with it (they keep their own
-- deleted_at null, so restoring the block brings them straight back). A task
-- moved somewhere, or an empty page the journal tidies away itself, is still
-- removed outright — Trash only holds what you chose to delete.

alter table public.tasks       add column deleted_at timestamptz;
alter table public.day_tasks   add column deleted_at timestamptz;
alter table public.blocks      add column deleted_at timestamptz;
alter table public.journal_pages add column deleted_at timestamptz;

create index tasks_trash_idx         on public.tasks (user_id, deleted_at)         where deleted_at is not null;
create index day_tasks_trash_idx     on public.day_tasks (user_id, deleted_at)     where deleted_at is not null;
create index blocks_trash_idx        on public.blocks (user_id, deleted_at)        where deleted_at is not null;
create index journal_pages_trash_idx on public.journal_pages (user_id, deleted_at) where deleted_at is not null;
