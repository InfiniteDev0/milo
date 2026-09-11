-- Milo — a pause that survives closing the app
--
-- Pausing the day was in-memory only: `paused` and the block/task to return to
-- were React state, so closing the tab lost both. You came back to an app that
-- did not know it was paused and had no idea which task you were on — the
-- failure this column exists to fix.
--
--   { pausedAt, blockId, taskId, note }
--
-- NULL means the day is running. That is why this column is nullable with no
-- default, unlike `journal`: "not paused" and "paused with nothing written in
-- it" are different facts and an empty object cannot tell them apart.
--
-- One jsonb rather than four columns for the same reason as journal — they are
-- always written together and always read together, and four separate fields
-- are four chances for them to disagree. They already did once: the pause
-- remembered the block without the task, and resuming dropped you into the
-- right room on no particular task.
--
-- It lives on the DAY, so a pause cannot outlive the day it belongs to. Pause
-- on Tuesday and open the app on Wednesday and there is simply no pause to
-- restore, because Wednesday is a different row. Nothing has to expire it.
--
-- No duration is stored. `pausedAt` is a clock reading, and how long you were
-- gone is never computed or shown — see TIME.md rule 5. The screen says "you
-- paused at 2:40pm, it's 6:52 now", which orients you without keeping a tally
-- that grows while you are not looking.

alter table public.days
  add column pause jsonb;
