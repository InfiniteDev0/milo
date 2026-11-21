// Product, under the navbar as ClickUp lays it out: what Milo has, in titled columns, each a coloured tile and a name.
// Only things the app does today.

import Link from "next/link";
import { CalendarDays, Columns3, Image, LayoutGrid, Palette, PenLine, Search, Smartphone, SquareCheck, Tag, Timer } from "lucide-react";

export const PRODUCT = [
  {
    title: "Plan",
    items: [
      { label: "Tasks", href: "/features#tasks", Icon: SquareCheck, tone: "#16a34a" },
      { label: "Blocks", href: "/features#blocks", Icon: Columns3, tone: "#e16b16" },
      { label: "Labels", href: "/features#labels", Icon: Tag, tone: "#ee5e99" },
      { label: "Calendar", href: "/features#calendar", Icon: CalendarDays, tone: "#e5484d" },
      { label: "Timer", href: "/features#timer", Icon: Timer, tone: "#0f9d9f" },
    ],
  },
  {
    title: "Write",
    items: [
      { label: "Notes", href: "/features#notes", Icon: PenLine, tone: "#7b68ee" },
      { label: "Covers", href: "/features#covers", Icon: Image, tone: "#f59e0b" },
      { label: "Search", href: "/features#search", Icon: Search, tone: "#1090e0" },
    ],
  },
  {
    title: "Make it yours",
    items: [
      { label: "Themes", href: "/features#themes", Icon: Palette, tone: "#b660e0" },
      { label: "On your phone", href: "/features#phone", Icon: Smartphone, tone: "#6985ff" },
    ],
  },
  {
    title: "More",
    items: [{ label: "All features", href: "/features", Icon: LayoutGrid, tone: "#18181b" }],
  },
];

// one row: the tile, then the name
export function ProductLink({ label, href, Icon, tone, onPick }) {
  return (
    <Link href={href} onClick={onPick} className="group flex items-center gap-2.5 rounded-lg py-1.5 text-[14px] text-black/85 transition-colors hover:text-black">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-[4px] text-white transition-transform group-hover:scale-110" style={{ background: tone }}>
        <Icon className="size-3" strokeWidth={2.5} />
      </span>
      {label}
    </Link>
  );
}

// the columns, as the panel under the bar shows them
export function ProductColumns({ onPick }) {
  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {PRODUCT.map((col) => (
        <div key={col.title} className="flex flex-col gap-2">
          <span className="font-mono text-[11px] tracking-[0.12em] text-black/45 uppercase">{col.title}</span>
          <div className="flex flex-col gap-1">
            {col.items.map((item) => (
              <ProductLink key={item.label} {...item} onPick={onPick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
