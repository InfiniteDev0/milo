"use client";

// Mute notifications ›, as ClickUp's: every way Milo speaks up, each one able
// to go quiet, including never (POSITIONING 9). The same settings as
// Settings › Interruptions, one step closer.

import { VolumeX } from "lucide-react";
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { usePreference } from "@/hooks/use-preference";
import { TASK_TIMER } from "@/lib/task-timer";
import { useBlocks } from "../blocks-provider";
import { Gap, ICON_CLASS, ROW_CLASS } from "./rows";

const CHECK_INS = [
  [0, "Never"],
  [30, "Every 30 min"],
  [60, "Every hour"],
  [90, "Every 1½ hours"],
  [120, "Every 2 hours"],
];
const REST = [
  [0, "Never"],
  [5, "After 5 min"],
  [10, "After 10 min"],
  [15, "After 15 min"],
];
const TIMER = [
  ["off", "Off"],
  ["toast", "In Milo"],
  ["desktop", "Desktop notification"],
];

const LABEL_CLASS = "px-2.5 pb-1 pt-2 text-xs font-normal text-muted-foreground";
const RADIO_CLASS = "h-8 cursor-pointer rounded-sm pl-2.5 text-sm focus:bg-muted";

function Choices({ label, value, options, onChange }) {
  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel className={LABEL_CLASS}>{label}</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
        {options.map(([v, text]) => (
          <DropdownMenuRadioItem key={v} value={v} closeOnClick={false} className={RADIO_CLASS}>
            {text}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuGroup>
  );
}

export function MuteMenu() {
  const { restMinutes, setRestMinutes, checkInMinutes, setCheckInMinutes } = useBlocks();
  const timer = usePreference(TASK_TIMER);
  // desktop needs the browser's say-so first, which Settings asks for
  const canDesktop = typeof Notification !== "undefined" && Notification.permission === "granted";

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className={`${ROW_CLASS} data-popup-open:bg-muted [&>svg:last-child]:text-muted-foreground`}>
        <VolumeX className={ICON_CLASS} />
        <span className="flex-1">Mute notifications</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent
        sideOffset={6}
        className="w-60 rounded-lg bg-popover p-1.5 shadow-xl ring-0 dark:bg-[#161616]"
      >
        <Choices label="Check in while a block runs" value={checkInMinutes} options={CHECK_INS} onChange={setCheckInMinutes} />
        <Gap />
        <Choices label="Say when a rest is over" value={restMinutes} options={REST} onChange={setRestMinutes} />
        <Gap />
        <Choices
          label="When a task's time is up"
          value={timer}
          options={canDesktop || timer === "desktop" ? TIMER : TIMER.slice(0, 2)}
          onChange={TASK_TIMER.set}
        />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
