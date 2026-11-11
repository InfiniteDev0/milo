import { cookies } from "next/headers";
import { BlockRail } from "@/components/app/block-rail";
import { DayControl } from "@/components/app/day-control";
import { ArchivePanel } from "@/components/app/archive-panel";
import { DayAhead } from "@/components/app/day-ahead";
import { CheckIn } from "@/components/app/check-in";
import { TaskTimer } from "@/components/app/task-timer";
import { MorningRecap } from "@/components/app/morning-recap";
import { TopBar } from "@/components/app/top-bar";
import { AppSidebar } from "@/components/app/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BlocksProvider } from "@/components/app/blocks-provider";
import { NotesProvider } from "@/components/app/notes-provider";
import { CategoriesProvider } from "@/components/app/categories-provider";
import { SetupWizard } from "@/components/app/setup-wizard";
import { MonthReview } from "@/components/app/month-review";
import { Tray } from "@/components/app/tray";
import { MiloChat } from "@/components/app/milo-chat";
import { ViewOnly } from "@/components/app/view-only";
import { StopBlocksInTasksView } from "@/components/app/tasks-view/stop-blocks";
import { UserProvider } from "@/components/app/user-provider";
import { WhatsNew } from "@/components/app/whats-new";
import { MobileHeader } from "@/components/app/mobile/header";
import { MobileTabBar } from "@/components/app/mobile/tab-bar";
import { ThemeColourSync } from "@/components/app/theme-colour-sync";
import { requireUser } from "@/lib/session";

/* The workspace shell, laid out as Manasik: three layers, no lines.
 *
 *   top      the bar across the whole width — Milo, then the search
 *   sidebar  under it, black, folds to an icon rail. Open or folded is kept
 *            in the sidebar_state cookie and read back here
 *   main     the page, beside the sidebar. The greeting and the date live in
 *            the page, not here, because they belong to the day being shown.
 *
 * Exactly one screen tall, never scrolls. Anything long scrolls inside <main>.
 *
 * Nothing in this group renders for a signed-out visitor: requireUser() calls
 * getUser(), which revalidates the token against Supabase and redirects if it
 * fails. proxy.ts redirects too — that one is for speed, this is the actual
 * guarantee. Every route under (app) inherits it for free.
 */
export default async function AppLayout({ children }) {
  const user = await requireUser();
  const sidebarOpen = (await cookies()).get("sidebar_state")?.value !== "false";
  const me = { name: user.name, email: user.email, avatarUrl: user.avatarUrl };

  return (
    <UserProvider user={me}>
    {/* the theme colour picked in Themes */}
    <ThemeColourSync />
    <BlocksProvider>
      {/* notes sit inside blocks: a note can belong to a block */}
      <NotesProvider>
      {/* categories sit inside notes: deleting one lets its notes go */}
      <CategoriesProvider>
      <SidebarProvider
        defaultOpen={sidebarOpen}
        className="fixed inset-0 min-h-0 flex-col overflow-hidden"
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          // wide enough for the names under the icons when folded
          "--sidebar-width-icon": "calc(var(--spacing) * 12)",
        }}
      >
        <TopBar user={me} />
        <div className="flex min-h-0 flex-1">
          {/* below the top bar (h-11), not over it */}
          <AppSidebar variant="inset" className="top-11 bottom-0 h-auto pt-0" />
          {/* phones: the whole screen, its header on top, the page under it with room for the floating bar */}
          <SidebarInset className="min-h-0 overflow-hidden bg-card max-md:fixed max-md:inset-0 max-md:m-0 max-md:rounded-none md:mt-0! md:rounded-sm!">
            <MobileHeader user={me} />
            <div className="flex min-h-0 flex-1 flex-col max-md:pb-[calc(env(safe-area-inset-bottom)+5.25rem)]">{children}</div>
            <MobileTabBar />
          </SidebarInset>
        </div>
      </SidebarProvider>

      <ArchivePanel />
      {/* today or tomorrow, one block at a time */}
      <DayAhead />
      {/* speaks while a block runs — see check-in.jsx for why this one
          interruption is allowed */}
      <ViewOnly view="blocks">
        <CheckIn />
      </ViewOnly>
      {/* says once when a task has run for the time you set on it */}
      <TaskTimer />
      {/* the steps through this update, on the home page until they're done */}
      <WhatsNew />
      {/* what yesterday held, if midnight filed it and nobody looked */}
      <ViewOnly view="blocks">
        <MorningRecap />
      </ViewOnly>
      {/* the Tasks view pauses the running block: the two don't run together */}
      <StopBlocksInTasksView />
      <SetupWizard />
      {/* the other door: opens when the calendar month turns over */}
      <MonthReview />
      {/* the notes sheet, on every page but Notes. Opened from the Milo panel */}
      <Tray />
      {/* Milo's face, bottom right, and the panel it opens */}
      <MiloChat />
      </CategoriesProvider>
      </NotesProvider>
    </BlocksProvider>
    </UserProvider>
  );
}

// {
//   /* Right — avatar, then the blocks */
// }
// <aside className="flex w-12 shrink-0 flex-col items-center gap-3">
//   <div className="flex h-12 shrink-0 items-center">{/* <UserAvatar /> */}</div>

//   <div className="relative w-full flex-1">{/* <BlockRail /> */}</div>

//   {/* Pause the whole day — for interruptions that don't wait for a
//               block to finish. Sits under the rail, same width. */}
//   {/* <DayControl /> */}
// </aside>;