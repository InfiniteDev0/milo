"use client";

/* Today / Month / Year.
 *
 * Not three nav destinations — one thing at three zoom levels. The day is made
 * of blocks, the month defines which blocks, the year rolls the months up. So
 * it's a scope control, not a menu, and it lives on the page rather than in the
 * nav rail.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

const SCOPES = [
  { href: "/daily", label: "Today" },
  { href: "/daily/monthly", label: "Month" },
  { href: "/daily/yearly", label: "Year" },
];

export function ScopeSwitcher() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-full bg-black/[0.05] p-1">
      {SCOPES.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200 ${
              active
                ? "bg-white text-black shadow-sm"
                : "text-black/45 hover:text-black/70"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
