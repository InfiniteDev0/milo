"use client";

/* The profile: your year, your month, and how loud Milo is allowed to be.
 *
 * One row per user, created by a trigger the moment the account exists, so
 * there is never a user without one and nothing downstream has to cope with a
 * missing row.
 *
 * The year and the month are jsonb because they are shapes the user invents —
 * a name, an icon, a list of things they want — and none of it is ever queried
 * by field. A column per property would be a migration every time someone
 * wants to add a thought to their vision board.
 */

import { createClient } from "@/lib/supabase/client";

export async function loadProfile() {
  const db = createClient();
  const { data, error } = await db
    .from("profiles")
    .select("year, month, rest_minutes, sound_on")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    year: data.year ?? null,
    month: data.month ?? null,
    restMinutes: data.rest_minutes ?? 5,
    soundOn: data.sound_on ?? true,
  };
}

/* Upsert rather than update: the trigger creates the row, but an account made
   before the trigger existed would have none, and a silent no-op would look
   exactly like a save that worked. */
export function saveProfile(userId, profile) {
  const db = createClient();
  return db.from("profiles").upsert(
    {
      id: userId,
      year: profile.year ?? null,
      month: profile.month ?? null,
      ...(profile.restMinutes === undefined
        ? {}
        : { rest_minutes: profile.restMinutes }),
      ...(profile.soundOn === undefined ? {} : { sound_on: profile.soundOn }),
    },
    { onConflict: "id" },
  );
}
