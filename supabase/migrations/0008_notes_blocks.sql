-- Milo — a note can belong to a block, and wears its own paper colour.
--
-- Notes are separate from the journal: something you write down during the
-- day, connected to a block or just a day note. Every note is kept.

-- The block it belongs to, if any. Deleting a block turns its notes into day
-- notes rather than deleting what you wrote.
alter table public.notes
  add column block_id uuid references public.blocks (id) on delete set null,
  add column colour   text not null default 'plain';

create index notes_block_idx on public.notes (user_id, block_id);
create index notes_created_idx on public.notes (user_id, created_at desc);

-- The old policy only checked the note was yours. A note may point at a block,
-- but only at one of your own.
drop policy "own notes" on public.notes;

create policy "own notes" on public.notes
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      block_id is null
      or exists (
        select 1 from public.blocks b
        where b.id = block_id and b.user_id = auth.uid()
      )
    )
  );
