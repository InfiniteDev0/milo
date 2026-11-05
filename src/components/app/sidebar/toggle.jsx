"use client";

// Top of the sidebar: open/fold (») with a short line under it. Folded, just
// the icon on the rail; open, a full-width row that says Collapse. From Manasik.

import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar();
  const open = state === "expanded";
  const Icon = open ? ChevronsLeftIcon : ChevronsRightIcon;

  return (
    <div className="flex flex-col gap-3 pt-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={open ? "Collapse the sidebar" : "Open the sidebar"}
        aria-expanded={open}
        className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-start text-base font-semibold text-sidebar-foreground transition-colors hover:bg-white/10 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:px-0"
      >
        <Icon className="size-5 shrink-0" strokeWidth={2.5} />
        <span className="truncate text-sm group-data-[collapsible=icon]:hidden">Collapse</span>
      </button>
      <span aria-hidden className="h-0.5 w-full rounded-full bg-sidebar-foreground/10 group-data-[collapsible=icon]:w-6" />
    </div>
  );
}
