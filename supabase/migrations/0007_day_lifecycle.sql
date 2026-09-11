-- Milo — how a day actually ends
--
-- Two columns, one bug each.
--
-- ─────────────────────────────────────────────────────────── tasks.archived
--
-- The task dialog has offered "Just once — done is done, it leaves the block"
-- since `kind` was added. Nothing ever read it. A once-task you finished came
-- back the next morning exactly like a routine one, which made the setting a
-- lie the user could see.
--
-- Archived rather than deleted, and archived rather than a `done_at`, because
-- blocks already work this way: `blocks.archived` is the established shape for
-- "kept, but not in front of you". Same word, same meaning, one level down.
--
-- Deleting was the other option and it is worse. `days.task_state` stores task
-- ids, so a deleted task turns every past day that mentions it into a row with
-- an id nothing can resolve — the record would rot behind you. Milo's whole
-- claim is that it remembers what you did.
--
-- ────────────────────────────────────────────────────────────── days.ended_at
--
-- Whether the day was closed on purpose.
--
-- Ending the day and the day ending are not the same event and the app had no
-- way to tell them apart. Midnight files every day whether or not you went
-- through the closing screen — POSITIONING: "an unended day simply ends" — so
-- something has to record which of those happened, or the next morning cannot
-- know whether you have already seen what yesterday held.
--
-- NULL means filed but never looked at. That is exactly the set of days the
-- morning recap is for, and dismissing the recap is what fills it in: reading
-- it IS closing it, one day late. So this doubles as the "seen" flag and no
-- second piece of state is needed to stop the recap coming back.

alter table public.tasks
  add column archived boolean not null default false;

alter table public.days
  add column ended_at timestamptz;
