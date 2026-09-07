import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Where magic links and OAuth land. Trades the one-time code for a session,
 *  then sends the user on. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Only ever a relative path, and validated below — a redirect target taken
  // raw from the query string is how open-redirect bugs get in.
  const next = searchParams.get("next") ?? "/daily";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/daily";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Expired or already-used link. Vague on purpose.
    return NextResponse.redirect(`${origin}/auth?error=link_invalid`);
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
