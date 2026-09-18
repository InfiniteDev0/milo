-- Milo — a note can belong to a task
--
-- A task used to carry a plain text box. Now a task can hold real notes: the same notes as everywhere else,
-- with the same editor, kept on the Notes page too.
--
-- Deleting a task never deletes what you wrote about it: its notes stay, just no longer tied to the task.

alter table public.notes
  add column task_id uuid references public.tasks (id) on delete set null;

create index notes_task_idx on public.notes (user_id, task_id)
  where task_id is not null;

-- A note may point at a block and at a task, but only at your own.
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
    and (
      task_id is null
      or exists (
        select 1 from public.tasks t
        where t.id = task_id and t.user_id = auth.uid()
      )
    )
  );
