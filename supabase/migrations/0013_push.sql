-- Milo — push notifications for the task timer
--
-- The timer is the one nudge the user asks for (POSITIONING 9). Until now it
-- spoke only while a Milo tab was alive. This lets it reach a locked phone or a
-- closed tab: each device that chose "Toast + notification" keeps a push
-- subscription here, and a cron job checks once a minute for timers that have
-- just come up.
--
-- Postgres can't sign a push itself, so the job hands what's due to /api/push
-- on Vercel, which signs and sends. The job finds; the route only delivers.
--
-- After running this file, run ONCE, with the live URL and the PUSH_SECRET
-- from .env.local (the same value goes in Vercel's environment):
--
--   insert into private.push_config (url, secret)
--   values ('https://miloplanner.vercel.app/api/push', '<PUSH_SECRET>');

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- ──────────────────────────────────────────────────── push_subscriptions ──
-- One row per device. The endpoint is the browser's own address for pushes.

create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "own push subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────── private ──
-- Not exposed through the API: nobody signed in or out can read these.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- where the job sends what's due, and the secret that proves it came from here
create table private.push_config (
  id     boolean primary key default true check (id),
  url    text not null,
  secret text not null
);

-- timers already announced: a task, on a day, at the minutes it was set to
create table private.push_told (
  task_id  uuid not null,
  stamp    text not null,
  minutes  int  not null,
  told_at  timestamptz not null default now(),
  primary key (task_id, stamp, minutes)
);

-- A timer is up when the task's time today (closed intervals plus the open one)
-- reaches its minutes. Only a timer that came up in the last ten minutes is
-- news; anything older is history, as it is in the app.
create or replace function private.push_due() returns void
language plpgsql security definer set search_path = '' as $$
declare
  cfg    private.push_config;
  pushes jsonb;
begin
  select * into cfg from private.push_config limit 1;
  if cfg.url is null then return; end if;

  with running as (
    select s.user_id, s.task_id, s.stamp, s.started_at, t.name, t.minutes
    from public.sessions s
    join public.tasks t on t.id = s.task_id
    where s.ended_at is null
      and t.minutes > 0
      and s.started_at > now() - interval '1 day'
  ),
  due as (
    select r.*,
      r.started_at + make_interval(secs => r.minutes * 60) - coalesce((
        select sum(x.ended_at - x.started_at) from public.sessions x
        where x.task_id = r.task_id and x.stamp = r.stamp and x.ended_at is not null
      ), interval '0') as up_at
    from running r
  ),
  fresh as (
    insert into private.push_told (task_id, stamp, minutes)
    select task_id, stamp, minutes from due
    where up_at <= now() and up_at > now() - interval '10 minutes'
    on conflict do nothing
    returning task_id
  )
  select jsonb_agg(jsonb_build_object(
    'endpoint', p.endpoint,
    'p256dh', p.p256dh,
    'auth', p.auth,
    'title', 'Milo',
    'body', d.minutes || case when d.minutes = 1 then ' minute' else ' minutes' end
      || ' on ' || d.name || '. The time you set.',
    -- the app's own key for this timer, so the two never stack
    'tag', d.task_id || ':' || d.minutes
  ))
  into pushes
  from fresh f
  join due d on d.task_id = f.task_id
  join public.push_subscriptions p on p.user_id = d.user_id;

  if pushes is null then return; end if;

  perform net.http_post(
    url := cfg.url,
    body := jsonb_build_object('pushes', pushes),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || cfg.secret
    )
  );
end $$;

revoke execute on function private.push_due() from public, anon, authenticated;

-- The route reports devices that have gone (unsubscribed, app removed). It
-- holds only the public key, so the secret is what lets it forget them.
create or replace function public.forget_push(secret text, endpoints text[]) returns void
language sql security definer set search_path = '' as $$
  delete from public.push_subscriptions p
  using private.push_config c
  where c.secret = forget_push.secret
    and p.endpoint = any(forget_push.endpoints);
$$;

revoke execute on function public.forget_push(text, text[]) from public, authenticated;
grant execute on function public.forget_push(text, text[]) to anon;

-- once a minute; scheduling the same name again replaces it
select cron.schedule('milo-push', '* * * * *', 'select private.push_due()');
