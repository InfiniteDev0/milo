"use client";

// Signing out had no home anywhere in the app before this.

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

export function Account() {
  const [leaving, setLeaving] = useState(false);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm">Account</h2>
        {/* Says what it costs, which is nothing. Signing out of a planner
            should not feel like a decision. */}
        <p className="text-xs text-foreground/40">
          Your day is saved. Everything is here when you come back.
        </p>
      </div>

      <Button
        type="button"
        disabled={leaving}
        onClick={async () => {
          setLeaving(true);
          try {
            await signOut();
            window.location.href = "/auth";
          } catch {
            setLeaving(false);
          }
        }}
        className="milo-lift h-10 w-fit cursor-pointer gap-2 rounded-xl border-0 bg-solid font-normal text-solid-ink hover:bg-solid-hover disabled:shadow-none"
        style={{ "--lift": "var(--solid-lift)" }}
      >
        <LogOut className="size-4" />
        {leaving ? "Signing out…" : "Sign out"}
      </Button>
    </section>
  );
}
