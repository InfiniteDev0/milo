-- Milo — the day's three entries
--
-- Morning, pause and night. One per lifecycle moment, exactly as they were on
-- paper — see SYSTEM.md §4.
--
-- On the DAY, not in notes. A journal entry is a fact about one date: it opens
-- with the morning, it closes with the night, and it belongs to the same row as
-- what actually happened that day. Filing it under notes would make it a
-- document you maintain rather than a thing you did.
--
-- One jsonb column rather than three text columns, and rather than a table:
-- they are always read together, always written together, and there will never
-- be a query that wants the mornings without the nights.

alter table public.days
  add column journal jsonb not null default '{}'::jsonb;

-- No constraint on which keys are present. An entry that does not exist is
-- absent, not empty — a day with only a morning entry is a complete day, and
-- nothing anywhere counts how many of the three were written.
