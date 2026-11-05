-- Milo — a day task's label is one of your categories
--
-- Run in the Supabase SQL editor after 0015. It adds one column and replaces
-- the day tasks policy with the same rule plus one check (that's the "drop
-- policy" the editor will warn about; no data is touched).
--
-- One way to group everything: a category holds its notes and its tasks.
-- Deleting the category leaves its tasks where they are, just unlabelled.

alter table public.day_tasks
  add column category_id uuid references public.categories (id) on delete set null;

create index day_tasks_category_idx on public.day_tasks (user_id, category_id)
  where category_id is not null;

-- yours, and a label may only be a category that is also yours
drop policy "own day tasks" on public.day_tasks;

create policy "own day tasks" on public.day_tasks
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      category_id is null
      or exists (
        select 1 from public.categories c
        where c.id = category_id and c.user_id = auth.uid()
      )
    )
  );
