"use client";

// The site's top bar, laid out as ClickUp's: Milo on the left; Product, Solutions and Learn (each opens a panel), Pricing and
// About in the middle; Log in and Sign up on the right. On a phone the pages fold into Menu.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import MiloFace from "../MiloFace";
import { ProductColumns } from "./product-menu";
import { LearnColumns } from "./learn-menu";
import { SolutionsColumns } from "./solutions-menu";

// the pages that open a panel, and what each panel holds
const MENUS = [
  { key: "product", label: "Product", Panel: ProductColumns, here: "/features" },
  { key: "solutions", label: "Solutions", Panel: SolutionsColumns },
  { key: "learn", label: "Learn", Panel: LearnColumns },
];

const NAV_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

// every link looks like Product: Albert Sans, regular (marked ! because globals.css's unlayered a { 500 } beats plain utilities), a soft fill under the pointer and on the page you are on
const LINK = "rounded-md px-2.5 py-1.5 [font-family:'Albert_sans']! text-[14px] font-normal! text-black/80 transition-colors hover:bg-black/[0.06] hover:text-black";
const ON = "bg-black/[0.06] text-black";
const FOLD = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.22, ease: "easeInOut" },
};

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // which panel is open: a MENUS key, or none
  const [menu, setMenu] = useState(null);
  const leave = useRef(null);

  // a new page folds everything away
  const [at, setAt] = useState(pathname);
  if (at !== pathname) {
    setAt(pathname);
    setMenu(null);
    setOpen(false);
  }
  // so does Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenu(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // the pointer can cross the gap between a page and its panel without it closing
  const show = (key) => {
    clearTimeout(leave.current);
    setMenu(key);
  };
  const hide = () => {
    clearTimeout(leave.current);
    leave.current = setTimeout(() => setMenu(null), 150);
  };
  const Panel = MENUS.find((m) => m.key === menu)?.Panel;

  return (
    <nav onMouseLeave={hide} className="sticky top-0 z-50 bg-white">
      <div className="relative mx-auto flex h-14 w-full max-w-[1200px] items-center gap-6 px-4 lg:px-11">
        <Link href="/" aria-label="Go to home" className="flex shrink-0 items-center gap-1">
          <MiloFace className="size-8 touch-none select-none" />
          <span className="text-[19px] font-semibold tracking-[-0.04em]">Milo</span>
        </Link>

        {/* the pages, in the middle of the bar */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1.5 md:flex">
          {MENUS.map(({ key, label, here }) => (
            <li key={key} onMouseEnter={() => show(key)}>
              <button
                type="button"
                aria-expanded={menu === key}
                onClick={() => setMenu((m) => (m === key ? null : key))}
                className={cn(LINK, "flex cursor-pointer items-center gap-1", (menu === key || pathname === here) && ON)}
              >
                {label}
                <ChevronDown className={cn("size-3.5 transition-transform duration-200", menu === key && "rotate-180")} />
              </button>
            </li>
          ))}
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href} onMouseEnter={hide}>
              <Link href={href} className={cn(LINK, "block", pathname === href && ON)}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div onMouseEnter={hide} className="ml-auto hidden items-center gap-2.5 md:flex">
          <Link href="/auth" className="rounded-md bg-black/[0.05] px-3 py-1 text-[14px] font-semibold transition-colors hover:bg-black/10">
            Log in
          </Link>
          <Link href="/auth" className="rounded-md bg-black px-3 py-1 text-[14px] font-semibold text-white transition-opacity hover:opacity-85">
            Sign up
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="ml-auto flex size-8 items-center justify-center rounded-lg bg-black/[0.05] md:hidden"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* the open panel: full width under the bar, its columns lined up with the bar's edges */}
      <AnimatePresence>
        {Panel && (
          <motion.div
            {...FOLD}
            onMouseEnter={() => show(menu)}
            className="absolute inset-x-0 top-full hidden overflow-hidden bg-white shadow-[0_24px_40px_-24px_rgba(0,0,0,0.25)] md:block"
          >
            <div className="mx-auto w-full max-w-[1200px] px-4 pt-3 pb-8 lg:px-11">
              {/* a fresh key, so switching panels swaps the columns in place */}
              <motion.div key={menu} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                <Panel onPick={() => setMenu(null)} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* phone: Product's columns, then the pages, then the way in */}
      <AnimatePresence>
        {open && (
          <motion.div {...FOLD} className="overflow-hidden md:hidden">
            <div className="flex flex-col gap-4 px-4 pb-4">
              <ProductColumns onPick={() => setOpen(false)} />
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} onClick={() => setOpen(false)} className="block rounded-lg px-1 py-2.5 text-[15px] active:bg-black/5">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/auth" className="rounded-lg bg-black/[0.05] py-1.5 text-center text-[14px] font-semibold">
                  Log in
                </Link>
                <Link href="/auth" className="rounded-lg bg-black py-1.5 text-center text-[14px] font-semibold text-white">
                  Sign up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
