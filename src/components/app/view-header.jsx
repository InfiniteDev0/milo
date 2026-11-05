"use client";

// The bar along the top of both views: Today (or, given a label, that label in
// its place), then ‹ ›, then whatever the view adds at the end. The same height and padding as the app's top bar; the line
// under it runs edge to edge. Leave out onPrev/onNext and the arrows rest.

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// the Today button's box, also used for the labels and counts that sit in this bar
// the border darker on a light page, where the theme's own border barely shows against white
export const BOX = "flex h-7 items-center rounded-sm border border-foreground/20 px-2.5 text-[13px] tabular-nums dark:border-border";

// the count in a box (Notes 19, Archived 0): a firm grey on light, the muted chip on dark
export const COUNT = "rounded-sm bg-foreground/[0.08] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-foreground/75 dark:bg-muted dark:font-normal dark:text-muted-foreground";

const ARROW =
  "flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors enabled:cursor-pointer enabled:hover:bg-muted enabled:hover:text-foreground disabled:opacity-35";

// start: a whole element in the Today button's place (the Blocks view's day menu)
export function ViewHeader({ start, label, onToday, onPrev, onNext, restingTitle, children }) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border px-4 py-1.5">
      {start ?? (label ? (
        // boxed, the same as the Today button it stands in for
        <span className={`me-1.5 ${BOX}`}>{label}</span>
      ) : (
      <button
        type="button"
        onClick={onToday}
        className={cn(
          "me-1.5 h-7 rounded-sm border border-foreground/20 px-2.5 text-[13px] transition-colors dark:border-border",
          onToday && "cursor-pointer hover:bg-muted",
        )}
      >
        Today
      </button>
      ))}
      <button type="button" aria-label="Earlier days" title={onPrev ? undefined : restingTitle} disabled={!onPrev} onClick={onPrev} className={ARROW}>
        <ChevronLeft className="size-4" />
      </button>
      <button type="button" aria-label="Later days" title={onNext ? undefined : restingTitle} disabled={!onNext} onClick={onNext} className={ARROW}>
        <ChevronRight className="size-4" />
      </button>
      {children && <div className="ms-auto flex min-w-0 items-center gap-3">{children}</div>}
    </div>
  );
}
