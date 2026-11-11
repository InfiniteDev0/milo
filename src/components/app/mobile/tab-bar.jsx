"use client";

// Phones only (Manasik's strategy): the sidebar gives way to a glass bar floating at the bottom.
// Home, Notes and Journal, each an icon over its name, the one you're on in a lighter pill that
// slides across. More grows the bar upward with the rest of the pages. Beside it, +, its own
// round button, opens Create. Every target is at least 44px.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LayoutGrid, NotebookPen, Plus, SquareCheck, Trash2, UserRound, X } from "lucide-react";
import { maskStyle } from "@/lib/mask";
import { cn } from "@/lib/utils";
import { VIEW } from "@/lib/view";
import { askDraft } from "@/lib/day-draft";
import { useNotes } from "../notes-provider";
import { ShellFace } from "../shell-face";
import { BottomSheet } from "./bottom-sheet";
import { GLASS } from "./glass";

const TABS = [
  { title: "Home", icon: "/home.svg", href: "/daily" },
  { title: "Notes", icon: "/pencil.svg", href: "/notes" },
  { title: "Journal", icon: "/notes.svg", href: "/journal" },
  { title: "More", href: null },
];

// More's pages: an svg (a mask, coloured by state) or a lucide icon. Milo first: it opens his panel
const APPS = [
  { title: "Ask Milo", milo: true },
  { title: "Calendar", icon: "/calendar.svg", href: "/calendar" },
  { title: "Leaderboard", icon: "/leaderboard.svg", href: "/leaderboard" },
  { title: "Settings", icon: "/seetings.svg", href: "/settings" },
  { title: "Profile", Icon: UserRound, href: "/profile" },
  { title: "Trash", Icon: Trash2, href: "/trash" },
];

const here = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);
// which tab a page belongs to: its own, or More for the rest
const tabFor = (pathname) => {
  const own = TABS.findIndex((t) => t.href && here(pathname, t.href));
  return own >= 0 ? own : TABS.length - 1;
};
const ACTIVE = "bg-[linear-gradient(135deg,#ffd600,#00d078)]";

export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { addNote, canWrite } = useNotes();
  const [more, setMore] = useState(false);
  const [creating, setCreating] = useState(false);
  // a new page folds More away
  const [at, setAt] = useState(pathname);
  if (at !== pathname) {
    setAt(pathname);
    if (more) setMore(false);
  }
  const active = more ? TABS.length - 1 : tabFor(pathname);

  // every tab's page loaded ahead, so switching is instant
  useEffect(() => {
    for (const t of [...TABS, ...APPS]) if (t.href) router.prefetch(t.href);
  }, [router]);

  // the sheet slides away first, then the page moves
  const after = (fn) => {
    setCreating(false);
    window.setTimeout(fn, 280);
  };
  const CREATE = [
    {
      title: "Task",
      hint: "On today, in Tasks",
      Icon: SquareCheck,
      tile: "bg-(--theme-accent)",
      run: () =>
        after(() => {
          VIEW.set("tasks");
          askDraft();
          if (pathname !== "/daily") router.push("/daily");
        }),
    },
    {
      title: "Note",
      hint: "A blank page, saved as you write",
      Icon: NotebookPen,
      tile: "bg-[#00b86b]",
      run: () =>
        after(() => {
          const note = addNote({ blockId: null });
          if (note) router.push(`/notes?note=${note.id}`);
        }),
    },
  ];

  return (
    <>
      <BottomSheet open={creating} onOpenChange={setCreating} title="Create">
        <ul className="flex flex-col px-3 pt-1 pb-4">
          {CREATE.filter((c) => c.title !== "Note" || canWrite).map(({ title, hint, Icon, tile, run }) => (
            <li key={title}>
              <button type="button" onClick={run} className="flex w-full items-center gap-4 rounded-2xl px-2 py-3 text-start active:bg-muted">
                <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl text-white", tile)}>
                  <Icon className="size-6" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[17px] font-medium">{title}</span>
                  <span className="truncate text-sm text-muted-foreground">{hint}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>

      {/* the bottom of the screen fades into a soft blur behind the bar */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-[calc(env(safe-area-inset-bottom)+7rem)] bg-gradient-to-t from-background/85 to-transparent backdrop-blur-md [mask-image:linear-gradient(to_top,black_40%,transparent)] md:hidden"
      />
      {/* More open: a tap anywhere else closes it */}
      {more && <button type="button" aria-label="Close" onClick={() => setMore(false)} className="fixed inset-0 z-[35] bg-black/10 md:hidden dark:bg-black/30" />}

      <nav aria-label="Main" className="fixed inset-x-4 bottom-[max(0.75rem,calc(env(safe-area-inset-bottom)-0.5rem))] z-40 flex items-end md:hidden">
        {/* one glass shape: More grows it upward and folds it back down */}
        <div className={cn("flex min-w-0 flex-1 flex-col overflow-hidden rounded-[30px] p-1.5", GLASS)}>
          <AnimatePresence initial={false}>
            {more && (
              <motion.div
                key="apps"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-x-2 gap-y-4 px-2.5 pt-4 pb-3">
                  {APPS.map(({ title, icon, Icon, href, milo }) => {
                    if (milo)
                      return (
                        <button
                          key="milo"
                          type="button"
                          onClick={() => {
                            setMore(false);
                            window.dispatchEvent(new Event("milo:chat"));
                          }}
                          className="flex touch-manipulation flex-col items-center gap-1.5 active:scale-95"
                        >
                          <span className="flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-chip">
                            <ShellFace className="size-16 touch-none select-none" />
                          </span>
                          <span className="w-full truncate text-center text-[13px] text-foreground/70">{title}</span>
                        </button>
                      );
                    const on = here(pathname, href);
                    return (
                      <Link key={href} href={href} onClick={() => setMore(false)} aria-current={on ? "page" : undefined} className="flex touch-manipulation flex-col items-center gap-1.5 active:scale-95">
                        <span className={cn("flex size-16 items-center justify-center rounded-2xl", on ? "bg-black/10 dark:bg-white/20" : "bg-black/5 dark:bg-white/10")}>
                          {icon ? (
                            <span aria-hidden className={cn("size-7", on ? ACTIVE : "bg-foreground/55")} style={maskStyle(icon)} />
                          ) : (
                            <Icon className={cn("size-7", on ? "text-foreground" : "text-foreground/55")} />
                          )}
                        </span>
                        <span className={cn("w-full truncate text-center text-[13px]", on ? "font-semibold text-foreground" : "text-foreground/70")}>{title}</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* the tabs, one pill under the one you're on, sliding to the next */}
          <div className="relative flex items-center">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/4 rounded-full bg-black/[0.07] transition-[translate] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-white/15"
              style={{ translate: `${active * 100}% 0` }}
            />
            {TABS.map((t, i) => {
              const look = cn(
                "relative flex h-12 min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1 rounded-full transition-colors",
                i === active ? "text-foreground" : "text-foreground/55",
              );
              if (!t.href)
                return (
                  <button key="more" type="button" aria-expanded={more} onClick={() => setMore((v) => !v)} className={look}>
                    {more ? <X className="size-5" /> : <LayoutGrid className="size-5" />}
                    <span className="text-[11px] leading-none font-medium">{more ? "Close" : "More"}</span>
                  </button>
                );
              return (
                <Link key={t.href} href={t.href} onClick={() => setMore(false)} aria-current={i === active ? "page" : undefined} className={look}>
                  <span aria-hidden className="size-5 bg-current" style={maskStyle(t.icon)} />
                  <span className="text-[11px] leading-none font-medium">{t.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* + steps aside while More is open */}
        <AnimatePresence initial={false}>
          {!more && (
            <motion.button
              key="create"
              type="button"
              aria-label="Create"
              onClick={() => setCreating(true)}
              initial={{ opacity: 0, scale: 0.6, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, scale: 1, width: 60, marginLeft: 12 }}
              exit={{ opacity: 0, scale: 0.6, width: 0, marginLeft: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className={cn("flex h-15 shrink-0 touch-manipulation items-center justify-center overflow-hidden rounded-full text-foreground active:scale-95", GLASS)}
            >
              <Plus className="size-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
