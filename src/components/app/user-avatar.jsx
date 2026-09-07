"use client";

/* One click, one destination. There was a dropdown here with Profile, Billing,
   Settings and Log out — four choices in front of the one thing anybody clicks
   an avatar for. */

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar() {
  return (
    <Link
      href="/profile"
      aria-label="Your profile"
      /* A photo has no colour of its own to darken, so the side is a flat
         neutral — dark enough to read against the rail, translucent so it
         works whatever the rail becomes. */
      className="milo-lift block rounded-xl"
      style={{ "--lift": "#222222" }}
    >
      <Avatar className="size-12 rounded-xl border-0">
        <AvatarImage
          src="https://github.com/shadcn.png"
          alt=""
          className="rounded-xl"
        />
        <AvatarFallback className="rounded-xl">A</AvatarFallback>
      </Avatar>
    </Link>
  );
}
