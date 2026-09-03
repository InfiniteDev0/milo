import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "milo_session";

/* IMPORTANT — this is routing, not authentication.
 *
 * Proxy runs on the edge runtime, where firebase-admin cannot run, so the
 * cookie's signature is NOT verified here. All this does is keep signed-out
 * people from seeing an app shell flash before being bounced.
 *
 * Real verification happens in the (app) layout via getCurrentUser(), which
 * calls verifySessionCookie on the server. Anyone can forge the *presence* of
 * a cookie; nobody can forge one that verifies. Never let this file be the
 * only thing standing between a request and someone's data.
 */
export function proxy(request: NextRequest) {
  const hasCookie = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/auth";
  const isProtected =
    pathname.startsWith("/daily") ||
    pathname.startsWith("/monthly") ||
    pathname.startsWith("/yearly") ||
    pathname.startsWith("/habits") ||
    pathname.startsWith("/library") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/ideas") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/welcome");

  if (isProtected && !hasCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/daily";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth",
    "/welcome/:path*",
    "/daily/:path*",
    "/monthly/:path*",
    "/yearly/:path*",
    "/habits/:path*",
    "/library/:path*",
    "/projects/:path*",
    "/ideas/:path*",
    "/settings/:path*",
  ],
};
