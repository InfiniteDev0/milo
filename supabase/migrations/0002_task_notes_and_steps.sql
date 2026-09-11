-- Milo — a note on a task, and steps inside one
--
-- THE RULE THAT MAKES STEPS SAFE: steps never roll up.
--
-- The block's rings, the day's count, the month calendar and every reflection
-- number count TASKS. A task with six steps and a task with one must contribute
-- exactly the same amount to a day, or breaking something down would make your
-- day look emptier than leaving it vague — which would punish the exact
-- behaviour the research says helps.
--
-- Nothing in this migration is aggregated anywhere outside its own task.

-- A short note on a task. Separate from `reason`, which answers "why am I
-- doing this" and is set once. This is scratch space — where you left off, a
-- link, a phone number.
alter table public.tasks add column note text not null default '';

-- ───────────────────────────────────────────────────────────────── steps ──
-- The checklist inside a task. Deliberately thin: text, done, order. No dates,
-- no estimates, no reason — a step that needs those is a task.

create table public.steps (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  task_id     uuid not null references public.tasks on delete cascade,
  name        text not null,
  done        boolean not null default false,
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create index steps_task_idx on public.steps (task_id, position);

alter table public.steps enable row level security;

create policy "own steps" on public.steps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
