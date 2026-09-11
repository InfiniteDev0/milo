-- Milo — a task has no duration until someone says so
--
-- `minutes` was `not null default 15`, and every task ever created took it. The
-- dialog then reported "Takes: 15 minutes" as though it were the user's answer.
-- It was not: nobody was asked.
--
-- Two things were wrong with that.
--
-- FABRICATION. Milo invented a number about someone's task and displayed it as
-- a fact. Everything else in this app reports what happened or what the user
-- said; this reported neither.
--
-- AND IT DISABLED A FEATURE IN SILENCE. Tasks split at five minutes — a MOMENT
-- gets a one-tap row, a SESSION gets a draggable card. With every task sitting
-- at 15, nothing was ever a moment, so that split has never once worked for
-- anybody.
--
-- Null now means "no estimate", which is both the honest default and the common
-- case. An estimate is set by hand, by the person whose task it is.

alter table public.tasks alter column minutes drop default;
alter table public.tasks alter column minutes drop not null;

-- Existing rows all carry the invented 15, and there is no way to tell those
-- apart from a real 15 somebody typed. Clearing is the safer direction: a wrong
-- estimate on screen is exactly the fabrication this migration removes, while a
-- blank one asks a question nobody has to answer.
update public.tasks set minutes = null where minutes = 15;
