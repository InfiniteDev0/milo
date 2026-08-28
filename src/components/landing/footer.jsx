"use client";

import Link from "next/link";
import { useState } from "react";
import { CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGES = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Features", href: "/features" },
];

const SOCIALS = [
  { label: "X", href: "https://x.com", icon: XIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedinIcon },
];

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="w-full  px-3 py-4">
      <div className="relative w-full overflow-hidden rounded-[32px] bg-white p-10 md:p-14">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          {/* Left: newsletter */}
          <div className="flex flex-col gap-6">
            <h2 className="m-0 text-2xl font-normal text-black/70">
              Sign up for our newsletter
            </h2>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2 rounded-full bg-white/70 p-1.5"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-56 bg-transparent px-4 py-2 text-sm text-black outline-none placeholder:text-black/40 sm:w-64"
              />
              <Button
                type="submit"
                className="bg-black text-white text-sm font-medium rounded-full px-5 py-2 h-auto transition-colors duration-300 hover:bg-black/80"
              >
                Subscribe
              </Button>
            </form>
          </div>

          {/* Right: pages */}
          <div className="flex items-start gap-3">
            <span className="flex items-center gap-1 pt-0.5 text-black/40">
              <CornerDownRight className="size-4" />
              Pages
            </span>
            <ul className="flex flex-col gap-2">
              {PAGES.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-black transition-colors duration-300 hover:text-[#5e17eb]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Socials */}
        <div className="mt-16 flex items-center gap-3">
          {SOCIALS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex size-9 items-center justify-center rounded-full bg-white/70 text-black transition-colors duration-300 hover:bg-white"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <a
            href="mailto:hello@milo.app"
            className="text-4xl font-normal text-black transition-colors duration-300 hover:text-[#5e17eb] sm:text-5xl"
          >
            hello@milo.app
          </a>
          <p className="m-0 text-sm text-black/40">
            Milo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
