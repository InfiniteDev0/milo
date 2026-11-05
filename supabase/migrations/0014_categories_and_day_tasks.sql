-- Milo — note categories, and the Tasks view's day tasks
--
-- Run in the Supabase SQL editor after 0013. Every table here has RLS on and a
-- policy scoped to auth.uid(), like every table before it.

-- ──────────────────────────────────────────────────────────── categories ──
-- Somewhere a note can live that isn't a Life Block: Projects, Resources, a
-- to-do list, something just for fun (CLAUDE.md: "MVP 2 adds other homes
-- outside blocks"). Two levels and no deeper: a category, and subcategories
-- inside it. A note sits in at most one of either.

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  -- set for a subcategory. Deleting a category takes its subcategories with it;
  -- the notes inside either are never deleted (see notes.category_id below)
  parent_id   uuid references public.categories (id) on delete cascade,
  name        text not null default '',
  -- what the icon picker chose: { type: 'emoji', value } | { type: 'icon', name, color }
  -- | { type: 'image', src } (a picture, shrunk to 64px before it gets here), or null
  icon        jsonb,
  favorite    boolean not null default false,
  position    double precision not null default 0,  -- the order YOU put them in
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- a shrunk picture is a few KB; this stops a full-size one being stored by mistake
  constraint categories_icon_small check (icon is null or octet_length(icon::text) <= 65536)
);

create index categories_user_idx on public.categories (user_id, parent_id, position);

create trigger categories_touch
  before update on public.categories
  for each row execute function public.touch_updated_at();

-- Two levels, enforced here rather than trusted to the app: a subcategory's
-- parent must be a top-level category, and a category that has subcategories
-- can't become one itself.
create function public.categories_two_levels()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_id is not null then
    if new.parent_id = new.id then
      raise exception 'a category cannot sit inside itself';
    end if;
    if exists (select 1 from public.categories p where p.id = new.parent_id and p.parent_id is not null) then
      raise exception 'subcategories cannot have subcategories';
    end if;
    if exists (select 1 from public.categories c where c.parent_id = new.id) then
      raise exception 'a category with subcategories cannot become a subcategory';
    end if;
  end if;
  return new;
end;
$$;

create trigger categories_two_levels
  before insert or update of parent_id on public.categories
  for each row execute function public.categories_two_levels();

alter table public.categories enable row level security;

-- yours, and a subcategory may only hang under a category that is also yours
create policy "own categories" on public.categories
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      parent_id is null
      or exists (
        select 1 from public.categories p
        where p.id = parent_id and p.user_id = auth.uid()
      )
    )
  );

-- ─────────────────────────────────────────────────── a note's category ──
-- Separate from block_id: a note can belong to a block, a category, both or
-- neither. Deleting a category leaves its notes where they are, just
-- uncategorised. The old unused `category` text column (default 'ideas') is
-- left alone.

alter table public.notes
  add column category_id uuid references public.categories (id) on delete set null;

create index notes_category_idx on public.notes (user_id, category_id)
  where category_id is not null;

-- A note may point at a block, a task and a category, but only at your own.
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
    and (
      category_id is null
      or exists (
        select 1 from public.categories c
        where c.id = category_id and c.user_id = auth.uid()
      )
    )
  );

-- ───────────────────────────────────────────────────────────── day tasks ──
-- The Tasks view: a row of day columns, each holding the tasks you put on it.
--
-- These are NOT rows of public.tasks, and `day` is NOT a due date. A block
-- task belongs to a block and never to a date (0001) — that rule stands. A day
-- task's `day` is only the column it sits in. Nothing reads it to decide that
-- something is late: an undone task stays on its own day, is never carried
-- forward, never counted as missed, never badged. Past days are there to look
-- back at, and dragging a task off one copies it.
--
-- Steps and the note live on the row. Steps never roll up (0002): a task with
-- six steps counts the same as a task with none.

create table public.day_tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  day         date not null,
  title       text not null default '',
  done        boolean not null default false,
  position    double precision not null default 0,  -- order within its day
  minutes     int check (minutes is null or minutes >= 0),  -- the estimate, optional
  actual_ms   bigint not null default 0 check (actual_ms >= 0),  -- time spent, banked
  started_at  timestamptz,  -- set while its clock is running
  note        text not null default '',
  steps       jsonb not null default '[]',  -- [{ id, name, done }]
  repeat      text not null default 'none'
              check (repeat in ('none', 'daily', 'weekdays', 'weekly', 'biweekly', 'monthly', 'yearly')),
  -- for a repeating task: which days' copies were ticked, { "Thu Nov 05 2026": true }
  done_on     jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index day_tasks_user_day_idx on public.day_tasks (user_id, day, position);

create trigger day_tasks_touch
  before update on public.day_tasks
  for each row execute function public.touch_updated_at();

alter table public.day_tasks enable row level security;

create policy "own day tasks" on public.day_tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
