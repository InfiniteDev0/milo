import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/* Two jobs:
 *
 * 1. Refresh the auth tokens on every matched request and write the rotated
 *    cookies onto the response. Server Components can't set cookies, so if this
 *    doesn't happen here, sessions quietly expire mid-use.
 *
 * 2. Redirect. Unlike the Firebase version — which could only check that a
 *    cookie *existed*, because firebase-admin can't run on the edge —
 *    supabase.auth.getUser() revalidates the token against Supabase Auth, so
 *    this is a real check, not an optimistic one.
 *
 * Pages still call getCurrentUser() for their own data. Defence in depth.
 */

/* Every route under (app). Missing one is not an authorisation hole — the
   (app) layout calls requireUser() and that is the real guarantee — but this
   list also drives the matcher below, and the matcher decides where tokens
   get REFRESHED. A signed-in user sitting on an unmatched route stops having
   their session renewed and is eventually signed out mid-use. */
const PROTECTED = [
  "/daily",
  "/notes",
  "/profile",
  "/settings",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not put logic between createServerClient and getUser — a stray early
  // return here is the classic way to end up with users randomly signed out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    return redirectPreservingCookies(request, response, "/auth");
  }

  if (pathname === "/auth" && user) {
    return redirectPreservingCookies(request, response, "/daily");
  }

  return response;
}

/** A fresh redirect response would drop the refreshed auth cookies, which logs
 *  the user out on the very next request. Copy them across. */
function redirectPreservingCookies(
  request: NextRequest,
  from: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: [
    "/auth",
    "/daily/:path*",
    "/notes/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
