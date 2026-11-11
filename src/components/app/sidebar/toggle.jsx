"use client";

// Top of the sidebar: open/fold (») with a short line under it. Folded, just
// the icon on the rail; open, a full-width row that says Collapse. From Manasik.
// On Notes the sidebar stays folded to its rail and this folds or opens Notes' own side instead.

import { useEffect, useRef } from "react";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePreference } from "@/hooks/use-preference";
import { NOTES_SIDEBAR } from "@/lib/notes-sidebar";

export function SidebarToggle() {
  const { state, toggleSidebar, setOpen } = useSidebar();
  const notes = usePathname().startsWith("/notes");
  const notesSide = usePreference(NOTES_SIDEBAR) === "open";
  // on Notes it shows Notes' side, not this one
  const open = notes ? notesSide : state === "expanded";
  const Icon = open ? ChevronsLeftIcon : ChevronsRightIcon;
  const press = notes ? () => NOTES_SIDEBAR.set(notesSide ? "closed" : "open") : toggleSidebar;

  // open before Notes folded it: opened again on the way out
  const was = useRef(false);
  useEffect(() => {
    if (notes) {
      if (state === "expanded") {
        was.current = true;
        setOpen(false);
      }
    } else if (was.current) {
      was.current = false;
      setOpen(true);
    }
    // only on the way in and out of Notes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  const what = notes ? "the notes sidebar (Ctrl+\\)" : "the sidebar";
  return (
    // on Notes with its side open, the side's own « does it: this one folds away (an accordion)
    // and the pages slide up into its place
    <div
      inert={notes && open}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
        notes && open ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
      )}
    >
    {/* clipped top to bottom only, so the rounded tile keeps its sides */}
    <div className="flex min-h-0 flex-col gap-3 overflow-x-visible overflow-y-clip pt-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
      <button
        type="button"
        onClick={press}
        aria-label={open ? `Collapse ${what}` : `Open ${what}`}
        title={notes ? (open ? `Close ${what}` : `Open ${what}`) : undefined}
        aria-expanded={open}
        className="group/toggle flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-start text-base font-semibold text-sidebar-foreground transition-colors hover:bg-(--rail-hover) group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:px-0"
      >
        <Icon className="size-5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/toggle:scale-115" strokeWidth={2.5} />
        <span className="truncate text-sm group-data-[collapsible=icon]:hidden">Collapse</span>
      </button>
      <span aria-hidden className="h-0.5 w-full rounded-full bg-sidebar-foreground/10 group-data-[collapsible=icon]:w-6" />
    </div>
    </div>
  );
}
