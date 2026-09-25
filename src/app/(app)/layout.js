import Link from "next/link";
import { ShellFace } from "@/components/app/shell-face";
import { BlockRail } from "@/components/app/block-rail";
import { DayControl } from "@/components/app/day-control";
import { AppNav } from "@/components/app/app-nav";
import { FocusLock } from "@/components/app/focus-lock";
import { SoundToggle } from "@/components/app/sound-toggle";
import { ArchivePanel } from "@/components/app/archive-panel";
import { BlockSheet } from "@/components/app/block-sheet";
import { DayAhead } from "@/components/app/day-ahead";
import { CheckIn } from "@/components/app/check-in";
import { TaskTimer } from "@/components/app/task-timer";
import { MorningRecap } from "@/components/app/morning-recap";
import { UserAvatar } from "@/components/app/user-avatar";
import { BlocksProvider } from "@/components/app/blocks-provider";
import { NotesProvider } from "@/components/app/notes-provider";
import { SetupWizard } from "@/components/app/setup-wizard";
import { MonthReview } from "@/components/app/month-review";
import { Tray } from "@/components/app/tray";
import { requireUser } from "@/lib/session";

/* The workspace shell — three columns, no header.
 *
 *   left    Milo, then the nav
 *   centre  the page. The greeting and the date live in there, not here,
 *           because they belong to the day being shown.
 *   right   the avatar, then the block rail
 *
 * h-svh + overflow-hidden: exactly one screen tall, never scrolls. Anything
 * long scrolls inside <main>.
 *
 * Nothing in this group renders for a signed-out visitor: requireUser() calls
 * getUser(), which revalidates the token against Supabase and redirects if it
 * fails. proxy.ts redirects too — that one is for speed, this is the actual
 * guarantee. Every route under (app) inherits it for free.
 */
export default async function AppLayout({ children }) {
  await requireUser();

  return (
    <BlocksProvider>
      {/* notes sit inside blocks: a note can belong to a block */}
      <NotesProvider>
      <div className="fixed inset-0 flex gap-4 overflow-hidden p-3 sm:gap-6 sm:p-4">
        {/* Left — brand, then nav */}
        <aside className="flex w-12 shrink-0 flex-col items-center gap-3">
          <Link
            href="/daily"
            aria-label="Milo"
            className="flex shrink-0 items-center rounded-lg bg-chip shadow"
          >
            <ShellFace className="size-12 touch-none select-none" />
          </Link>

          {/* the nav pins itself to this box, so it must be relative — and
            flex-1 makes it take the slack, which is what pushes the avatar
            to the bottom of the column */}
          <div className="relative w-full flex-1">
            <AppNav />
          </div>

          <div className="flex flex-col gap-4 shrink-0 items-center justify-center pb-1">
            {/* focus time — locks the lineup down to the running block */}
            <FocusLock />
            {/* next to the lock on purpose: both are switches for how loud
                the app is allowed to be at you */}
            <SoundToggle />
            <UserAvatar />
          </div>
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl bg-card">
          {children}
        </main>
      </div>

      <ArchivePanel />
      {/* one block, looked at without starting it */}
      <BlockSheet />
      {/* today or tomorrow, one block at a time */}
      <DayAhead />
      {/* speaks while a block runs — see check-in.jsx for why this one
          interruption is allowed */}
      <CheckIn />
      {/* says once when a task has run for the time you set on it */}
      <TaskTimer />
      {/* what yesterday held, if midnight filed it and nobody looked */}
      <MorningRecap />
      <SetupWizard />
      {/* the other door: opens when the calendar month turns over */}
      <MonthReview />
      {/* the notes sheet and its button, on every page but Notes */}
      <Tray />
      </NotesProvider>
    </BlocksProvider>
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