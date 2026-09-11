-- Milo — initial schema
--
-- Run in the Supabase SQL editor, or `supabase db push` if you wire the CLI.
--
-- THE SECURITY MODEL IS RLS. The anon key is public by design — it ships in the
-- browser bundle — so a table without a policy is a table any visitor can read.
-- Every table here has RLS enabled and a policy scoped to auth.uid(). There is
-- no table in this file you may add without doing the same.

-- ─────────────────────────────────────────────────────────────── profile ──
-- One row per user. Holds what the setup wizard collected: the year and month
-- the person named, and their vision board.

create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  year        jsonb,                    -- { name, icon, goals, vision[] }
  month       jsonb,                    -- { name, icon }
  rest_minutes int not null default 5,  -- POSITIONING 9: the user sets this
  sound_on    boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────── blocks ──
-- The shape of a day. Redefined per month; archived rather than deleted.

create table public.blocks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  name        text not null,
  bg          text not null,
  ink         text not null,
  position    int  not null default 0,  -- the order YOU put them in
  archived    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index blocks_user_idx on public.blocks (user_id, position);

-- ───────────────────────────────────────────────────────────────── tasks ──
-- A task belongs to a BLOCK, never to a date.
--
-- There is no due_date column and there must never be one. That is what makes
-- "nothing is ever overdue" structurally true instead of a promise the UI has
-- to keep. A date column would let one query invent a late state.

create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  block_id    uuid not null references public.blocks on delete cascade,
  name        text not null,
  reason      text not null default '',
  minutes     int  not null default 15,  -- the ESTIMATE. see sessions for actual
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create index tasks_block_idx on public.tasks (block_id, position);

-- ────────────────────────────────────────────────────────────────── days ──
-- The state of one calendar day. Separate from blocks and tasks so that
-- resetting a day never touches the things you shaped.
--
-- `stamp` is a local date string from the client, not a server date: the day
-- rolls over at the user's midnight, not UTC's.

create table public.days (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  stamp       text not null,
  started_at  timestamptz,
  block_state jsonb not null default '{}'::jsonb,  -- { blockId: "todo|ongoing|paused|done" }
  task_state  jsonb not null default '{}'::jsonb,  -- { taskId: "todo|doing|done" }
  dropped     jsonb not null default '[]'::jsonb,  -- block ids set aside today
  unique (user_id, stamp)
);

create index days_user_idx on public.days (user_id, stamp desc);

-- ────────────────────────────────────────────────────────────── sessions ──
-- The interval log. See TIME.md.
--
-- Exactly one row per user may have ended_at null — the partial unique index
-- below enforces it in the database, so a race or a second tab cannot produce
-- two clocks running at once. That invariant is what makes block time and task
-- time incapable of disagreeing.

create table public.sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  stamp       text not null,
  block_id    uuid references public.blocks on delete set null,
  task_id     uuid references public.tasks  on delete set null,
  started_at  timestamptz not null,
  ended_at    timestamptz,
  check (ended_at is null or ended_at >= started_at)
);

create unique index sessions_one_open
  on public.sessions (user_id)
  where ended_at is null;

create index sessions_user_day_idx on public.sessions (user_id, stamp);

-- ───────────────────────────────────────────────────────────────── notes ──

create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  title       text not null default '',
  body        text not null default '',   -- html from the editor
  plain       text not null default '',   -- same text, stripped, so search works
  category    text not null default 'ideas',
  starred     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index notes_user_idx on public.notes (user_id, updated_at desc);
create index notes_search_idx on public.notes
  using gin (to_tsvector('english', title || ' ' || plain));

-- ─────────────────────────────────────────────────────────── row security ──
-- Nothing above is readable until these exist.

alter table public.profiles enable row level security;
alter table public.blocks   enable row level security;
alter table public.tasks    enable row level security;
alter table public.days     enable row level security;
alter table public.sessions enable row level security;
alter table public.notes    enable row level security;

-- Milo is not a team tool (POSITIONING). Nobody sees anybody else's day, so
-- every policy is the same shape: it's yours or it doesn't exist.

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own blocks" on public.blocks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own days" on public.days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own sessions" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own notes" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────── signup ──
-- A profile row the moment an account exists, so nothing downstream has to
-- cope with a user who has none.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────────────────────────────────────── updated_at ──

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touched before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger notes_touched before update on public.notes
  for each row execute function public.touch_updated_at();
