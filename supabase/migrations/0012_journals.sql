-- Milo — journals you keep as books
--
-- A journal is a book on the shelf; its pages are rows, in order. A page is
-- one of a few kinds: plain writing, an entry (morning / pause / night, set out
-- like the paper page in SYSTEM.md §4), a day plan (a two-page spread), a
-- month plan, or the year's vision.
--
-- Separate from days.journal (0004): that holds the entries the day's own
-- lifecycle writes. These are pages you choose to write in a book. Nothing
-- counts them, nothing asks for them — an empty book is a complete book.

create table public.journals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null default 'My Journal',
  cover      text not null default 'leaves',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.journal_pages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  journal_id  uuid not null references public.journals (id) on delete cascade,
  -- a float, so a page can slot in between two others without renumbering
  position    double precision not null,
  kind        text not null default 'write'
              check (kind in ('write', 'day-schedule', 'day-plan', 'month', 'vision')),
  -- the day ('2026-9-25'), month ('2026-9') or year ('2026') a page is about
  stamp       text,
  -- an optional label on a writing page; never required
  entry       text check (entry in ('morning', 'pause', 'night')),
  -- true on the first page of an entry: it carries the heading
  heads       boolean not null default false,
  body        text not null default '',
  -- a planner page's lines: priorities, to-dos, hours, month plans
  data        jsonb not null default '{}'::jsonb,
  -- references, not copies: a pinned note or block shows as it is now
  notes       uuid[] not null default '{}',
  blocks      uuid[] not null default '{}',
  bookmarked  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index journal_pages_order_idx on public.journal_pages (journal_id, position);

-- Voice notes are heavy, so they sit in their own table and load with the page.
-- The audio rides as a data URI, the same stopgap as note images, until Storage exists.
create table public.journal_voice (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  page_id    uuid not null references public.journal_pages (id) on delete cascade,
  audio      text not null,
  seconds    integer not null default 0,
  created_at timestamptz not null default now()
);

create index journal_voice_page_idx on public.journal_voice (page_id);

alter table public.journals enable row level security;
alter table public.journal_pages enable row level security;
alter table public.journal_voice enable row level security;

create policy "own journals" on public.journals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- a page may only sit in one of your own journals
create policy "own journal pages" on public.journal_pages
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.journals j where j.id = journal_id and j.user_id = auth.uid())
  );

create policy "own journal voice" on public.journal_voice
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.journal_pages p where p.id = page_id and p.user_id = auth.uid())
  );
