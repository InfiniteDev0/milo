import { createBrowserClient } from "@supabase/ssr";

/** Browser client. Safe to expose: the anon key is an identifier, and Row Level
 *  Security is what actually protects the data. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
