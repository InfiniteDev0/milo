"use client";

import { createClient } from "./supabase/client";

/* Client-side sign-in. Every one of these hands off to Supabase, which sets
   the auth cookies itself — there is no session endpoint to call afterwards,
   which is the main thing that got simpler moving off Firebase. */

function callbackUrl(next = "/daily") {
  // Built from window.location.origin, never from a query parameter.
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** Passwordless email link. Matches the form: one field, no password. */
export async function sendLoginLink(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl(),
      // true would let anyone type any address and get an account. Signup is
      // still allowed — Supabase creates the user on first successful link —
      // this just keeps the flow honest about which it was.
      shouldCreateUser: true,
    },
  });
  if (error) throw error;
}

async function oauth(provider: "google" | "apple") {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl() },
  });
  if (error) throw error;
}

export const signInWithGoogle = () => oauth("google");
export const signInWithApple = () => oauth("apple");

export async function signOut() {
  const supabase = createClient();
  // scope 'global' revokes refresh tokens everywhere, not just this browser.
  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) throw error;
}
