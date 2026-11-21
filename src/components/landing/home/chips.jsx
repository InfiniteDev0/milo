// What's inside, as a row of small tiles under the way in.

import { CalendarDays, Palette, Search, Smartphone } from "lucide-react";
import { maskStyle } from "@/lib/mask";

const CHIPS = [
  { label: "Tasks", svg: "/home.svg", tone: "#5e17eb" },
  { label: "Notes", svg: "/pencil.svg", tone: "#00b86b" },
  { label: "Blocks", svg: "/blocks.svg", tone: "#e16b16" },
  { label: "Calendar", Icon: CalendarDays, tone: "#1090e0" },
  { label: "Search", Icon: Search, tone: "#ee5e99" },
  { label: "Themes", Icon: Palette, tone: "#b660e0" },
  { label: "Phone", Icon: Smartphone, tone: "#0f9d9f" },
];

export function Chips() {
  return (
    <ul className="flex max-w-3xl flex-wrap justify-center gap-2">
      {CHIPS.map(({ label, svg, Icon, tone }) => (
        <li key={label} className="flex items-center gap-2 rounded-2xl bg-[#f4f2ee] py-2 pr-3.5 pl-2 text-sm text-black/75 transition-transform hover:-translate-y-0.5">
          <span className="flex size-7 items-center justify-center overflow-hidden rounded-lg" style={{ background: `${tone}1f` }}>
            {svg ? (
              <span aria-hidden className="size-4" style={{ ...maskStyle(svg), background: tone }} />
            ) : (
              <Icon className="size-4" style={{ color: tone }} />
            )}
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}
