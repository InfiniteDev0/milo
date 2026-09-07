"use client";

/* The nav rail. Icons only, with the label on hover — the app is small enough
   that four glyphs carry it, and a permanent list of words is the thing this
   shell is trying not to be.

   The active item is blur.png sitting *inside* the rail: sized a little wider
   than its tile and blurred, so it reads as a contained glow with dark still
   visible around it. Oversizing it spills past the rail and washes out. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ITEMS = [
  { href: "/daily", label: "Today", icon: "/calendar.svg" },
  { href: "/notes", label: "Notes", icon: "/notes.svg" },
  { href: "/ideas", label: "Idea Dump", icon: "/idea.svg" },
];

const PINNED = [{ href: "/settings", label: "Settings", icon: "/seetings.svg" }];

function NavItem({ href, label, icon, active }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Link href={href} aria-label={label} aria-current={active ? "page" : undefined} />}
        className="group/item relative flex size-10 items-center justify-center"
      >
        {active && (
          <>
            {/* decorative: the label is on the link, this is never announced */}
          </>
        )}

        {/* The svg is used as a mask, not an image, so colour comes from state
            instead of each file's own baked-in gradient: green when active,
            the notes orange→pink on hover, plain grey at rest. */}
        <span
          aria-hidden
          style={{
            WebkitMaskImage: `url(${icon})`,
            maskImage: `url(${icon})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
          className={`relative size-[22px] transition-all duration-200 ${
            active
              ? "bg-[linear-gradient(135deg,#ffd600,#00d078)]"
              : "bg-white/40 group-hover/item:bg-[linear-gradient(135deg,#ffd600,#ff007a)]"
          }`}
        />
      </TooltipTrigger>

      <TooltipContent side="right" sideOffset={14}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <TooltipProvider delay={200}>
      <nav className="absolute left-0 top-0 z-20 flex w-12 flex-col items-center gap-4 rounded-[14px] bg-[#0d0d0d] py-3.5">
        {ITEMS.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}

        <Separator className="data-horizontal:w-5 bg-white/10" />

        {PINNED.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>
    </TooltipProvider>
  );
}
