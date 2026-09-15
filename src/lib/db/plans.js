"use client";

// Days prepared ahead, against the database: which tasks sit a day out, which blocks are set aside in advance.

import { createClient } from "@/lib/supabase/client";

// a day with no row simply has no plan; never mutate this, spread it
export const EMPTY_PLAN = Object.freeze({ skipped: [], setAside: [] });

const fromRow = (r) => ({ skipped: r.skipped ?? [], setAside: r.set_aside ?? [] });

// the plans for these days, keyed by stamp
export async function loadPlans(stamps) {
  const db = createClient();
  const { data, error } = await db
    .from("day_plans")
    .select("stamp, skipped, set_aside")
    .in("stamp", stamps);

  if (error) throw error;
  return Object.fromEntries(data.map((r) => [r.stamp, fromRow(r)]));
}

// the whole plan for one day; plan-queue makes sure the newest one is what lands
export function savePlan(userId, stamp, plan) {
  const db = createClient();
  return db.from("day_plans").upsert(
    { user_id: userId, stamp, skipped: plan.skipped, set_aside: plan.setAside },
    { onConflict: "user_id,stamp" },
  );
}
