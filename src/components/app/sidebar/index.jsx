"use client";

// Manasik's sidebar: black, folds to an icon rail. The open/fold button on top,
// then the pages; Settings pinned at the bottom.

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SidebarToggle } from "./toggle";
import { NAV_BOTTOM, NAV_MAIN, NavMain } from "./nav";

// the sidebar's colour tokens re-pointed for this subtree only, so the page keeps its theme
const BLACK_SIDEBAR_CLASS = [
  "[&>[data-sidebar=sidebar]]:bg-black",
  "data-[mobile=true]:bg-black",
  "text-sidebar-foreground",
  "[--sidebar-foreground:oklch(0.985_0_0)]",
  "[--sidebar-accent:oklch(1_0_0/10%)]",
  "[--sidebar-accent-foreground:oklch(0.985_0_0)]",
  "[--sidebar-border:oklch(1_0_0/12%)]",
  "[--sidebar-ring:oklch(1_0_0/40%)]",
].join(" ");

export function AppSidebar({ className, ...props }) {
  return (
    <Sidebar collapsible="icon" className={cn(BLACK_SIDEBAR_CLASS, className)} {...props}>
      <SidebarHeader>
        <SidebarToggle />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NAV_MAIN} />
      </SidebarContent>
      <SidebarFooter>
        <NavMain items={NAV_BOTTOM} />
      </SidebarFooter>
    </Sidebar>
  );
}
