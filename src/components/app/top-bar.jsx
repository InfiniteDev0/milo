"use client";

// The bar across the top, as Manasik's: no line under it. Your workspace and
// today at the start, as ClickUp's; search, Tasks or Blocks, your pinned
// tools and you at the end. Phones get a button for the sidebar sheet.

import { MenuIcon } from "lucide-react";
import { WorkspaceMenu } from "./workspace-menu";
import { TodayButton } from "./workspace-menu/today-button";
import { Search } from "./search";
import { UserMenu } from "./user-menu";
import { PinnedTools } from "./user-menu/pinned";
import { ViewTabs } from "./view-tabs";
import { useSidebar } from "@/components/ui/sidebar";

export function TopBar({ user }) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="relative flex h-11 shrink-0 items-center gap-2 px-2 py-1.5">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Open the sidebar"
        className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
      >
        <MenuIcon className="size-5" />
      </button>

      <div className="relative z-10 flex min-w-0 items-center gap-1.5">
        <WorkspaceMenu user={user} />
        <TodayButton />
      </div>

      {/* the far end: search, Tasks or Blocks, what you pinned from the avatar menu, then you */}
      <div className="relative ms-auto flex shrink-0 items-center gap-2">
        <Search />
        <ViewTabs />
        <PinnedTools />
        <UserMenu user={user} />
      </div>
    </div>
  );
}
