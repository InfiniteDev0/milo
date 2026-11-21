// The bar along the top of the board's day, as the app's view-header.jsx: something at the start, then ‹ ›, then
// whatever the view adds at the end. Leave out onPrev/onNext and the arrows rest, greyed, as the Blocks view's do.

import { ChevronLeft, ChevronRight } from "lucide-react";

const ARROW =
  "flex size-7 items-center justify-center rounded-md text-(--b-ink3) enabled:cursor-pointer enabled:hover:bg-(--b-fill2) enabled:hover:text-(--b-ink) disabled:opacity-35";

export function BoardHeader({ start, onPrev, onNext, restingTitle, children }) {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="me-2">{start}</span>
      <button type="button" aria-label="Earlier days" title={onPrev ? undefined : restingTitle} disabled={!onPrev} onClick={onPrev} className={ARROW}>
        <ChevronLeft className="size-4" />
      </button>
      <button type="button" aria-label="Later days" title={onNext ? undefined : restingTitle} disabled={!onNext} onClick={onNext} className={ARROW}>
        <ChevronRight className="size-4" />
      </button>
      {children && <span className="ml-auto hidden items-center gap-2 sm:flex">{children}</span>}
    </div>
  );
}
