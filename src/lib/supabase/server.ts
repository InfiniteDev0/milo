import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server client for server components, route handlers and server actions.
 * Reads and writes the auth cookies that @supabase/ssr manages for us — the
 * whole session-cookie layer we hand-wrote for Firebase is this file now.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components can't set cookies. Harmless: proxy.ts refreshes
            // the session on every request, so the tokens stay current anyway.
          }
        },
      },
    },
  );
}
