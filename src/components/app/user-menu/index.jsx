"use client";

/* You, at the end of the top bar, and everything that belongs to you — laid
   out as ClickUp's menu: you and Profile, the switches for
   how loud Milo is, settings, then Trash and Log out. What isn't built yet is
   listed anyway, marked Soon. Your day (Personal Tools, tools.js) was taken out
   on 5 Nov at the user's ask, to come back later; tools.js stays, the top bar's
   pinned tools still read it. */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Bell,
  ChevronDown,
  CircleHelp,
  Command,
  Download,
  LogOut,
  PaintRoller,
  Settings,
  Trash2,
  Volume2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePreference } from "@/hooks/use-preference";
import { signOut } from "@/lib/auth";
import { SOUND, playTask } from "@/lib/sound";
import { MuteMenu } from "./mute-menu";
import { Photo } from "./photo";
import { replayTour } from "../whats-new/steps";
import { MenuStats } from "./stats";
import { Gap, ICON_CLASS, ROW_CLASS, Row, SoonRow, Switch } from "./rows";
import { useInstall } from "./use-install";

function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className={`${ROW_CLASS} data-popup-open:bg-muted [&>svg:last-child]:text-muted-foreground`}>
        <PaintRoller className={ICON_CLASS} />
        <span className="flex-1">Themes</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent sideOffset={6} className="w-44 rounded-lg border border-foreground/15 bg-popover p-1.5 shadow-xl ring-0 dark:border-border dark:bg-[#161616]">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {[["light", "Light"], ["dark", "Dark"], ["system", "Same as device"]].map(([v, text]) => (
            <DropdownMenuRadioItem key={v} value={v} closeOnClick={false} className="h-8 cursor-pointer rounded-sm pl-2.5 text-sm focus:bg-muted">
              {text}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

export function UserMenu({ user }) {
  const router = useRouter();
  const install = useInstall();
  const sound = usePreference(SOUND) === "on";
  const [leaving, setLeaving] = useState(false);

  const logOut = async () => {
    setLeaving(true);
    try {
      await signOut();
      // refresh() clears the cached render, so nothing of this account lingers
      router.replace("/auth");
      router.refresh();
    } catch {
      setLeaving(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Your account"
        className="flex cursor-pointer items-center gap-0.5 rounded-sm p-0.5 pe-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-expanded:bg-muted dark:hover:bg-white/10"
      >
        <Photo user={user} className="size-6 rounded-sm" />
        <ChevronDown className="size-3.5 shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        // a firm edge and a real shadow: in light mode it's white over white cards, and without them it reads as part of the page
        className="scrollbar-pill w-[22rem] max-w-[calc(100vw-1rem)] rounded-lg border border-foreground/15 bg-popover p-1.5 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.28),0_2px_8px_rgba(0,0,0,0.08)] ring-0 dark:border-border dark:bg-[#161616] dark:shadow-xl"
      >
        {/* you, in a card, with Profile at the end */}
        <div className="flex items-center gap-3 rounded-sm bg-muted/60 p-2.5 dark:bg-white/[0.06]">
          <Photo user={user} className="size-10 rounded-sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-medium">{user.name || "You"}</p>
            {user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
          </div>
          <Link
            href="/profile"
            className="shrink-0 rounded-sm bg-foreground/10 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-foreground/15"
          >
            Profile
          </Link>
        </div>

        {/* your two counts, then the Leaderboard and your place on it */}
        <div className="pt-1.5">
          <MenuStats />
        </div>

        <Gap />

        {/* how loud Milo is allowed to be */}
        <MuteMenu />
        <Row
          icon={Volume2}
          closeOnClick={false}
          onClick={() => {
            SOUND.set(sound ? "off" : "on");
            // turning it on plays the smallest cue, so you hear what you chose
            if (!sound) playTask();
          }}
          end={<Switch on={sound} />}
        >
          Sound effects
        </Row>

        <Gap />
        <Row icon={Settings} href="/settings">Settings</Row>
        <Row icon={Bell} href="/settings?tab=interruptions">Notifications</Row>
        <ThemeMenu />
        <Row icon={Command} href="/settings?tab=shortcuts">Keyboard shortcuts</Row>
        {install ? (
          <Row icon={Download} onClick={install} end={<ArrowUpRight className="size-4 text-muted-foreground" />}>
            Install Milo
          </Row>
        ) : (
          <SoonRow icon={Download}>Install Milo</SoonRow>
        )}
        {/* Help: the tutorial (the What's new steps, replayed from the start) and, later, docs */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={`${ROW_CLASS} data-popup-open:bg-muted [&>svg:last-child]:text-muted-foreground`}>
            <CircleHelp className={ICON_CLASS} />
            <span className="flex-1">Help</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent sideOffset={6} className="w-52 rounded-lg border border-foreground/15 bg-popover p-1.5 shadow-xl ring-0 dark:border-border dark:bg-[#161616]">
            <Row icon={GraduationCap} onClick={replayTour}>
              Tutorial
            </Row>
            <SoonRow icon={BookOpen}>Docs</SoonRow>
          </DropdownMenuSubContent>
        </DropdownMenuSub>


        <Gap />
        <Row icon={Trash2} href="/trash">Trash</Row>
        <Row icon={LogOut} disabled={leaving} onClick={logOut}>
          {leaving ? "Logging out…" : "Log out"}
        </Row>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
