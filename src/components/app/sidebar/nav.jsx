"use client";

// The pages, as Manasik's sidebar lists them: icon and name side by side when
// open, the name small under the icon on the folded rail.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { maskStyle } from "@/lib/mask";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export const NAV_MAIN = [
  { href: "/daily", label: "Home", icon: "/home.svg" },
  { href: "/notes", label: "Notes", icon: "/pencil.svg" },
  { href: "/journal", label: "Journal", icon: "/notes.svg" },
];

export const NAV_BOTTOM = [{ href: "/settings", label: "Settings", icon: "/seetings.svg" }];

// the svg is a mask, so colour comes from state (the --rail-icon tokens): grey, yellow→pink on hover, yellow→green
// when active; on a coloured rail white, then black
function NavIcon({ src }) {
  return (
    <span className="flex shrink-0 items-center justify-center transition-colors duration-200 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:group-hover/menu-button:bg-(--rail-hover) group-data-[collapsible=icon]:group-data-active/menu-button:bg-(--rail-tile)!">
      <span
        aria-hidden
        style={maskStyle(src)}
        // a springy lift under the pointer
        className="size-5 shrink-0 bg-(--rail-icon) transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/menu-button:scale-115 group-hover/menu-button:-rotate-6 group-hover/menu-button:bg-(image:--rail-icon-hover) group-data-active/menu-button:bg-(image:--rail-icon-active)!"
      />
    </span>
  );
}

// bigger than shadcn's defaults; folded, the name sits small under the icon tile
const NAV_ITEM_CLASS = [
  "h-10 gap-3 px-3 text-[15px]",
  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-auto! group-data-[collapsible=icon]:h-auto! group-data-[collapsible=icon]:w-12! group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:bg-transparent! group-data-[collapsible=icon]:p-0!",
  "group-data-[collapsible=icon]:[&>span:last-child]:text-[11px] group-data-[collapsible=icon]:[&>span:last-child]:leading-tight",
  "text-sidebar-foreground/70 hover:text-sidebar-foreground data-active:text-sidebar-foreground",
  "data-active:bg-(--rail-tile) data-active:hover:bg-(--rail-tile)",
].join(" ");

export function NavMain({ items, className }) {
  const pathname = usePathname();
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <SidebarGroup className={className}>
      <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
        {items.map((item) => (
          <SidebarMenuItem key={item.href} data-tour={`nav-${item.label.toLowerCase()}`}>
            <SidebarMenuButton
              isActive={isActive(item.href)}
              className={NAV_ITEM_CLASS}
              render={<Link href={item.href} />}
            >
              <NavIcon src={item.icon} />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
