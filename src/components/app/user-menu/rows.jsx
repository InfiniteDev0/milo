"use client";

// The menu's pieces, styled as ClickUp's: tall rows, a grey icon, and whatever
// belongs at the far end — a switch, a shortcut, a pin, or Soon.

import Link from "next/link";
import { Pin } from "lucide-react";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { usePreference } from "@/hooks/use-preference";
import { cn } from "@/lib/utils";

export const ROW_CLASS =
  "group/row h-9 cursor-pointer gap-3 rounded-sm px-2.5 text-[15px] text-foreground/90 focus:bg-muted focus:text-foreground data-disabled:opacity-100 [&_svg:not([class*='size-'])]:size-[18px]";

export const ICON_CLASS = "shrink-0 text-muted-foreground group-focus/row:text-foreground";

export function Row({ icon: Icon, href, children, end, className, ...props }) {
  return (
    <DropdownMenuItem className={cn(ROW_CLASS, className)} render={href ? <Link href={href} /> : undefined} {...props}>
      {Icon && <Icon className={ICON_CLASS} />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {end}
    </DropdownMenuItem>
  );
}

// not built yet: shown, so you know it's coming, but it does nothing
export function SoonRow({ icon: Icon, children, end }) {
  return (
    <DropdownMenuItem disabled className={cn(ROW_CLASS, "cursor-default text-foreground/40")}>
      {Icon && <Icon className="shrink-0 text-muted-foreground/50" />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {end}
      <span className="rounded-sm bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Soon</span>
    </DropdownMenuItem>
  );
}

export function Switch({ on, disabled }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative h-[18px] w-8 shrink-0 rounded-full transition-colors",
        on ? "bg-[#00b86b]" : "bg-foreground/15",
        disabled && "opacity-40",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-3.5 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </span>
  );
}

export function Keys({ children }) {
  return <span className="shrink-0 text-xs text-muted-foreground">{children}</span>;
}

// pins a tool to the top bar. Faint until you hover the row; solid once pinned
export function PinButton({ pref, label }) {
  const pinned = usePreference(pref) === "on";
  return (
    <button
      type="button"
      aria-label={pinned ? `Unpin ${label} from the top bar` : `Pin ${label} to the top bar`}
      aria-pressed={pinned}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        pref.set(pinned ? "off" : "on");
      }}
      className={cn(
        "-me-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-opacity hover:bg-foreground/10",
        pinned ? "text-foreground opacity-100" : "text-muted-foreground opacity-0 group-hover/row:opacity-100 group-focus/row:opacity-100",
      )}
    >
      <Pin className="size-4" fill={pinned ? "currentColor" : "none"} />
    </button>
  );
}

// a short line between sections, inset to the rows rather than edge to edge
export function Gap() {
  return <DropdownMenuSeparator className="mx-2.5 my-2" />;
}
