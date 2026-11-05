"use client";

/* Your picture. It must not drop to a letter: the sign-in photo first, then the
   picture you had before, and the letter only if both fail to load.

   A plain img, not the Avatar primitive, so a failed load can be caught and
   swapped. no-referrer because Google profile photos refuse some hotlinked
   requests that send one. */

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_PHOTO = "https://github.com/shadcn.png";

export function Photo({ user, className }) {
  const sources = [user.avatarUrl, DEFAULT_PHOTO].filter(Boolean);
  const [failed, setFailed] = useState(0);
  const src = sources[failed];
  const next = useCallback(() => setFailed((n) => n + 1), []);

  // an image that failed before React hydrated never fires onError, so check on mount
  const check = useCallback(
    (img) => {
      if (img?.complete && img.naturalWidth === 0) next();
    },
    [next],
  );

  return (
    <span className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full bg-muted", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          ref={check}
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          onError={next}
          className="size-full object-cover"
        />
      ) : (
        <span className="flex size-full items-center justify-center text-sm text-muted-foreground">
          {(user.name || user.email || "?").trim()[0].toUpperCase()}
        </span>
      )}
    </span>
  );
}
