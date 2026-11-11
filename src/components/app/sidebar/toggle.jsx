"use client";

// Top of the sidebar: open/fold (») with a short line under it. Folded, just
// the icon on the rail; open, a full-width row that says Collapse. From Manasik.

import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { NOTES_SIDEBAR } from "@/lib/notes-sidebar";

export function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar();
  const open = state === "expanded";
  const Icon = open ? ChevronsLeftIcon : ChevronsRightIcon;
  const pathname = usePathname();
  // on Notes with its own sidebar folded (and no note open), » brings that one back first
  const press = () => {
    const notes = pathname.startsWith("/notes") && !new URLSearchParams(window.location.search).has("note");
    if (!open && notes && NOTES_SIDEBAR.get() === "closed") return NOTES_SIDEBAR.set("open");
    toggleSidebar();
  };

  return (
    <div className="flex flex-col gap-3 pt-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
      <button
        type="button"
        onClick={press}
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
