"use client";

// The site's top bar, laid out as ClickUp's: Milo and the pages on the left, Log in and Sign up on the right.
// On a phone the pages fold into Menu.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import MiloFace from "../MiloFace";

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-18 w-full max-w-[1500px] items-center gap-10 px-5 lg:px-14">
        <Link href="/" aria-label="Go to home" className="flex shrink-0 items-center gap-1.5">
          <MiloFace className="size-10 touch-none select-none" />
          <span className="text-2xl font-semibold tracking-[-0.04em]">Milo</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link href={href} className={cn("text-[17px] transition-colors hover:text-black", pathname === href ? "text-[#5e17eb]" : "text-black/65")}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          <Link href="/auth" className="rounded-xl bg-black/[0.05] px-4 py-2.5 text-[17px] font-medium transition-colors hover:bg-black/10">
            Log in
          </Link>
          <Link href="/auth" className="rounded-xl bg-black px-4 py-2.5 text-[17px] font-medium text-white transition-opacity hover:opacity-85">
            Sign up
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="ml-auto flex size-10 items-center justify-center rounded-xl bg-black/[0.05] md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden md:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 pb-5">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-lg active:bg-black/5">
                    {label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/auth" className="rounded-xl bg-black/[0.05] py-3 text-center font-medium">Log in</Link>
                <Link href="/auth" className="rounded-xl bg-black py-3 text-center font-medium text-white">Sign up</Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
