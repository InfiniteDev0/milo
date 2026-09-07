"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "@/lib/auth";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    try {
      await signOut();
      // refresh() clears the cached server render, so the shell can't linger
      // with the previous user's data after the redirect.
      router.replace("/auth");
      router.refresh();
    } catch {
      setBusy(false);
      toast.error("Couldn't sign out. Try again.");
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="cursor-pointer rounded-full px-3 py-1.5 text-sm text-black/50 transition-colors hover:bg-black/5 hover:text-black disabled:opacity-50"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
