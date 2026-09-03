import "server-only";

import { cookies } from "next/headers";
import { getAdminAuth } from "./firebase-admin";

export const SESSION_COOKIE = "milo_session";

/** Firebase caps session cookies at 14 days. */
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export const sessionCookieOptions = {
  name: SESSION_COOKIE,
  httpOnly: true, // JavaScript can never read it, so XSS can't steal the session
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, // blocks cross-site POSTs from riding the cookie
  path: "/",
  maxAge: SESSION_MAX_AGE_MS / 1000,
};

export type SessionUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
};

/**
 * The one place that decides whether a request is authenticated.
 * `checkRevoked` costs a lookup but means signing out — or disabling an
 * account — takes effect immediately instead of at cookie expiry.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const session = store.get(SESSION_COOKIE)?.value;
  if (!session) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      emailVerified: decoded.email_verified === true,
    };
  } catch {
    // Expired, revoked, or tampered with — all the same answer.
    return null;
  }
}
