// Learn, under the navbar as ClickUp lays it out: plain links in titled columns, and a card on the right that
// points somewhere worth reading. Milo has no customer stories yet, so the card is Milo's own promise, not a quote.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HEAD, ITEM } from "./menu-parts";

const LEARN = [
  {
    title: "Learn",
    items: [
      { label: "Try a day", href: "/about#try" },
      { label: "The research", href: "/about#research" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "About Milo",
    items: [
      { label: "What Milo promises", href: "/about#promises" },
      { label: "Who it's for", href: "/about#who" },
      { label: "Who's building it", href: "/about#building" },
      { label: "What Milo won't become", href: "/about#wont" },
    ],
  },
];

export function LearnColumns({ onPick }) {
  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {LEARN.map((col) => (
        <div key={col.title} className="flex flex-col gap-2">
          <span className={HEAD}>{col.title}</span>
          <div className="flex flex-col gap-1">
            {col.items.map(({ label, href }) => (
              <Link key={label} href={href} onClick={onPick} className={ITEM}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* the card: two columns wide on a big screen */}
      <div className="col-span-2 flex flex-col gap-2">
        <span className={HEAD}>Why Milo</span>
        <Link href="/about" onClick={onPick} className="group flex flex-col gap-4 rounded-xl bg-black/[0.03] p-5 transition-colors hover:bg-black/[0.05]">
          <span className="text-[17px] leading-snug text-black/85">&ldquo;Milo notices what you did, not what you didn&rsquo;t.&rdquo;</span>
          <span className="flex items-center gap-1 text-[14px] font-semibold">
            Read why
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
