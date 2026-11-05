"use client";

/* Top left, as ClickUp's workspace menu: Milo's face as the badge, your
   workspace's name, then Settings and Appearance and the things you manage.
   No members, plan or workspace switching — Milo is yours alone. */

import {
  Blocks,
  CalendarRange,
  ChevronDown,
  LayoutTemplate,
  PaintRoller,
  PenLine,
  Plug,
  Settings,
  Tag,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ShellFace } from "../shell-face";
import { Gap, Row, SoonRow } from "../user-menu/rows";

// Settings and Appearance side by side, as ClickUp's Settings and People
const BUTTON_CLASS =
  "flex h-9 cursor-pointer items-center justify-center gap-2 rounded-sm border border-border px-3 text-sm focus:bg-muted [&_svg]:size-4 [&_svg]:text-muted-foreground";

export function workspaceName(user) {
  const who = user.name || user.email?.split("@")[0] || "Your";
  return `${who}'s Room`;
}

function Badge({ className }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-chip", className)}>
      <ShellFace className="size-full touch-none select-none" />
    </span>
  );
}

export function WorkspaceMenu({ user }) {
  const name = workspaceName(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Your room"
        className="flex h-8 min-w-0 max-w-56 cursor-pointer xl:max-w-80 items-center gap-2 rounded-sm bg-black/5 pe-2 ps-1.5 text-sm font-semibold transition-colors hover:bg-muted aria-expanded:bg-muted dark:bg-white/5"
      >
        <Badge className="size-5 rounded-sm" />
        <span className="truncate">{name}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-80 max-w-[calc(100vw-1rem)] rounded-sm border border-border bg-popover p-1.5 shadow-xl ring-0 dark:bg-[#161616]"
      >
        <div className="flex items-center gap-3 p-2">
          <Badge className="size-12 rounded-sm" />
          <p className="min-w-0 truncate text-[17px] font-semibold">{name}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 px-1 pb-1">
          <DropdownMenuItem className={BUTTON_CLASS} render={<Link href="/settings" />}>
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className={BUTTON_CLASS} render={<Link href="/settings?tab=appearance" />}>
            <PaintRoller />
            Appearance
          </DropdownMenuItem>
        </div>

        <Gap />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2.5 pb-1 pt-1.5 text-xs font-normal text-muted-foreground">Manage</DropdownMenuLabel>
          <Row icon={Blocks} href="/settings?tab=blocks">Blocks</Row>
          <Row icon={CalendarRange} href="/settings?tab=week">Week themes</Row>
          <Row icon={PenLine} href="/settings?tab=writing">Writing</Row>
          <SoonRow icon={LayoutTemplate}>Templates</SoonRow>
          <SoonRow icon={Tag}>Categories</SoonRow>
          <SoonRow icon={Plug}>Integrations</SoonRow>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
