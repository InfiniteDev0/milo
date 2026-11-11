"use client";

// Phones only, in place of the top bar and the sidebar (Manasik's strategy): your workspace,
// and Tasks | Blocks on Home. Search is a pull down from the top (pull-to-search.jsx); Milo,
// Profile and Settings are under More. It keeps clear of the notch.

import { WorkspaceMenu } from "../workspace-menu";
import { ViewTabs } from "../view-tabs";
import { PullToSearch } from "./pull-to-search";

export function MobileHeader({ user }) {
  return (
    <header className="flex shrink-0 items-center gap-2 px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 md:hidden">
      <div className="flex min-w-0 flex-1">
        <WorkspaceMenu user={user} />
      </div>
      <ViewTabs />
      <PullToSearch />
    </header>
  );
}
