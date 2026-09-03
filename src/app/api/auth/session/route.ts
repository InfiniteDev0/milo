import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
  sessionCookieOptions,
} from "@/lib/session";

// firebase-admin needs Node APIs — it cannot run on the edge runtime.
export const runtime = "nodejs";

/** SameSite=lax already blocks most cross-site POSTs, but browsers send Origin
 *  on every cross-origin request, so checking it closes the gap explicitly. */
async function sameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (!origin) return true; // same-origin fetches may omit it
  const host = h.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!(await sameOrigin())) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  let idToken: unknown;
  try {
    ({ idToken } = await request.json());
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  if (typeof idToken !== "string" || idToken.length === 0) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    // checkRevoked: a token from a session that has since been signed out
    // must not be exchangeable for a fresh cookie.
    const decoded = await getAdminAuth().verifyIdToken(idToken, true);

    // Only a *recent* sign-in may mint a session cookie. Without this, a stolen
    // long-lived token could be traded for a 14-day session at any time.
    const fiveMinutes = 5 * 60;
    if (Date.now() / 1000 - decoded.auth_time > fiveMinutes) {
      return NextResponse.json(
        { error: "Please sign in again" },
        { status: 401 },
      );
    }

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const store = await cookies();
    store.set({ ...sessionCookieOptions, value: sessionCookie });

    return NextResponse.json({ ok: true });
  } catch {
    // Deliberately vague: never tell a caller *why* a token failed.
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/** Sign out. Clears the cookie and revokes refresh tokens, so every other
 *  session for this user dies too. */
export async function DELETE() {
  const store = await cookies();
  const session = store.get(SESSION_COOKIE)?.value;

  if (session) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(session, false);
      await getAdminAuth().revokeRefreshTokens(decoded.sub);
    } catch {
      // Already invalid — clearing the cookie is still the right outcome.
    }
  }

  store.set({ ...sessionCookieOptions, value: "", maxAge: 0 });
  return NextResponse.json({ ok: true });
}
