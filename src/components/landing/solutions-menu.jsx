// Solutions, under the navbar as ClickUp lays it out, but for people, not teams: Milo is for one person whose days
// don't hold still (POSITIONING.md), so the columns are who that is and what they use it for, then what's new.

import Link from "next/link";
import { ArrowRight, Palette, Smartphone } from "lucide-react";

const COLUMNS = [
  {
    title: "Who it's for",
    items: [
      { label: "Freelancers and creators", href: "/about#who" },
      { label: "Working from home", href: "/about#who" },
      { label: "Busy with work and family", href: "/about#who" },
      { label: "Coming back from burnout", href: "/about#who" },
    ],
    more: { label: "See who it's for", href: "/about#who" },
  },
  {
    title: "Use it for",
    items: [
      { label: "A week, a day at a time", href: "/features#tasks" },
      { label: "Notes beside your plans", href: "/features#notes" },
      { label: "Work and home, kept apart", href: "/features#blocks" },
    ],
  },
];

const FEATURED = [
  { label: "Milo on your phone", hint: "Home, Notes and + in a bar under your thumb", href: "/features#phone", Icon: Smartphone, tile: "from-[#6985ff] to-[#5e17eb]" },
  { label: "Themes", hint: "Your colour, across the whole app", href: "/features#themes", Icon: Palette, tile: "from-[#ee5e99] to-[#b660e0]" },
];

const HEAD = "font-mono text-[11px] tracking-[0.12em] text-black/45 uppercase";

export function SolutionsColumns({ onPick }) {
  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {COLUMNS.map((col) => (
        <div key={col.title} className="flex flex-col gap-2">
          <span className={HEAD}>{col.title}</span>
          <div className="flex flex-col gap-1">
            {col.items.map(({ label, href }) => (
              <Link key={label} href={href} onClick={onPick} className="py-1.5 text-[14px] text-black/85 transition-colors hover:text-black">
                {label}
              </Link>
            ))}
            {col.more && (
              <Link href={col.more.href} onClick={onPick} className="group flex items-center gap-1 py-1.5 text-[14px] text-[#5e17eb]">
                {col.more.label}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>
      ))}

      {/* what's new, two columns wide on a big screen */}
      <div className="col-span-2 flex flex-col gap-2">
        <span className={HEAD}>Featured</span>
        <div className="flex flex-col gap-1">
          {FEATURED.map(({ label, hint, href, Icon, tile }) => (
            <Link key={label} href={href} onClick={onPick} className="group flex items-center gap-3 rounded-lg py-1.5">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white transition-transform group-hover:scale-105 ${tile}`}>
                <Icon className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="flex items-center gap-2 text-[14px] text-black/85 group-hover:text-black">
                  {label}
                  <span className="rounded-[4px] bg-[#5e17eb]/8 px-1.5 py-px font-mono text-[10px] text-[#5e17eb]">NEW</span>
                </span>
                <span className="text-[13px] text-black/50">{hint}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
