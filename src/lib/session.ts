import "server-only";

import { createClient } from "./supabase/server";

export type SessionUser = {
  id: string;
  email: string | null;
};

/**
 * The one place that decides whether a request is authenticated.
 *
 * Always getUser(), never getSession(). getSession() only decodes the cookie
 * and trusts whatever is inside it; getUser() revalidates the token against
 * Supabase Auth, so a forged or revoked cookie fails here.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}

/** For layouts that must not render for signed-out visitors. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/auth");
  }
  return user;
}
