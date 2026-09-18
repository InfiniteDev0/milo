"use client";

// Every day row of one calendar year: which blocks ran and which tasks got done. Nothing else about a day is needed here.

import { createClient } from "@/lib/supabase/client";

export async function loadYearDays(year) {
  const db = createClient();
  const { data, error } = await db
    .from("days")
    .select("stamp, block_state, task_state")
    .like("stamp", `${year}-%`);

  if (error) throw error;
  return data;
}
