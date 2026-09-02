"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import MiloFace from "../MiloFace";

const NAV_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Features", href: "/features" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center rounded-[28px] bg-white p-2 shadow-[0px_1px_20px_0px_rgba(224,215,198,0.6)] w-[min(92vw,360px)] md:w-auto">
      {/* Top row */}
      <div className="flex w-full items-center justify-between gap-0 md:w-auto md:justify-center md:gap-14">
        {/* Logo — now a live face rather than a static <img> */}
        <Link
          href="/"
          aria-label="Go to home"
          className="flex shrink-0 items-center px-1"
        >
          <MiloFace className="size-12 touch-none select-none" />
        </Link>

        {/* Navigation links (desktop) */}
        <ul className="hidden items-center gap-1 px-2 md:flex">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            const linkClassName = `px-2 py-1 text-md inline-block cursor-pointer transition-opacity duration-200 hover:opacity-70 ${
              isActive ? "text-[#5e17eb]" : "text-black"
            }`;

            return (
              <li key={label}>
                <Link href={href} className={linkClassName}>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA button (desktop) */}
        <Button className="hidden md:flex items-center gap-3 bg-[#5e17eb] text-white text-md font-normal rounded-full pl-5 py-2 h-auto transition-opacity duration-200 hover:opacity-85 hover:bg-[#5e17eb]">
          Get started
          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white">
            <ArrowRight className="size-4 text-black" />
          </span>
        </Button>

        {/* Menu toggle (mobile/tablet) */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="md:hidden flex items-center gap-3 bg-black text-white text-md font-normal rounded-full pl-4 pr-1.5 py-1.5 h-auto transition-opacity duration-200 hover:opacity-85"
        >
          Menu
          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white">
            {open ? (
              <X className="size-4 text-black" />
            ) : (
              <Menu className="size-4 text-black" />
            )}
          </span>
        </button>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden mt-2 w-full overflow-hidden rounded-2xl bg-white"
          >
            <ul className="flex flex-col items-center gap-1 py-4">
              {NAV_LINKS.map(({ label, href }) => {
                const isActive = pathname === href;
                return (
                  <li key={label} className="w-full">
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`block w-full py-2.5 text-center text-md font-medium transition-opacity duration-200 hover:opacity-70 ${
                        isActive ? "text-[#5e17eb]" : "text-black"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
