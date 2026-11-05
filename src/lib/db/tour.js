"use client";

// How far you are through the "What's new" steps (profiles.tour, migration 0017).

import { createClient } from "@/lib/supabase/client";
import { queueWrite } from "./sync";

// your tour, or null when the column isn't there yet (0017 not run) — then nothing shows
export async function loadTour() {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data, error } = await db.from("profiles").select("tour").eq("id", user.id).single();
  if (error?.code === "42703") return null;
  if (error) throw error;
  return { userId: user.id, tour: data?.tour ?? {} };
}

// only the tour column, so nothing else on the profile is touched; ticks in a burst are one write
export function saveTour(userId, tour) {
  queueWrite("tour", () => createClient().from("profiles").update({ tour }).eq("id", userId), { wait: 400 });
}
