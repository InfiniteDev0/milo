// "Your day" in the avatar menu — Milo's answer to ClickUp's Personal Tools.
// A tool opens a page (href) or one of the shell's sheets (event). One with
// neither isn't built yet and shows as Soon. Pinnable ones can sit in the top bar.

import {
  AlarmClock,
  BookOpen,
  CalendarDays,
  CalendarRange,
  CirclePlus,
  LayoutDashboard,
  Mic,
  NotebookPen,
  Timer,
} from "lucide-react";
import { createPreference } from "@/lib/preference";

export const TOOLS = [
  { id: "task", label: "Add a task", icon: CirclePlus },
  { id: "today", label: "Today", icon: CalendarDays, href: "/daily" },
  { id: "time", label: "Time tracked", icon: Timer },
  { id: "notes", label: "Notes", icon: NotebookPen, href: "/notes", pin: true },
  // the journal keeps voice notes on its pages
  { id: "voice", label: "Voice note", icon: Mic, href: "/journal", pin: true },
  { id: "reminder", label: "Reminder", icon: AlarmClock },
  { id: "journal", label: "Journal", icon: BookOpen, href: "/journal", pin: true },
  { id: "month", label: "Your month", icon: CalendarRange, href: "/daily/monthly" },
  { id: "year", label: "Your year", icon: LayoutDashboard, href: "/daily/yearly" },
];

// one on/off per pinnable tool, kept on this device like the other preferences
export const PINS = Object.fromEntries(
  TOOLS.filter((t) => t.pin).map((t) => [t.id, createPreference(`milo:pin:${t.id}`, ["on", "off"], "off")]),
);

export const ready = (tool) => Boolean(tool.href || tool.event);

export function runEvent(tool) {
  const [name, detail] = tool.event;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}
