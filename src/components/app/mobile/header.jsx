"use client";

// Phones only, in place of the top bar and the sidebar (Manasik's strategy): your workspace on
// the left; Milo (the panel), Tasks | Blocks on Home, search and you on the right. It keeps clear
// of the notch.

import { WorkspaceMenu } from "../workspace-menu";
import { Search } from "../search";
import { UserMenu } from "../user-menu";
import { ViewTabs } from "../view-tabs";
import { ShellFace } from "../shell-face";

export function MobileHeader({ user }) {
  return (
    <header className="flex shrink-0 items-center gap-2 px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 md:hidden">
      <div className="flex min-w-0 flex-1">
        <WorkspaceMenu user={user} />
      </div>
      <ViewTabs />
      <button
        type="button"
        aria-label="Ask Milo"
        onClick={() => window.dispatchEvent(new Event("milo:chat"))}
        className="flex size-9 shrink-0 touch-manipulation items-center justify-center overflow-hidden rounded-lg bg-chip"
      >
        <ShellFace className="size-9 touch-none select-none" />
      </button>
      <Search />
      <UserMenu user={user} />
    </header>
  );
}
