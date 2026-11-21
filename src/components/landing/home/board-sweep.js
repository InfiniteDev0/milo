// The app's theme sweep (theme-toggle.jsx's "rectangle", bottom up), on the landing board alone: a view transition
// on the board's own name, with the page itself left still.

import { flushSync } from "react-dom";

export const BOARD_VT = "milo-board";

const STYLE_ID = "milo-board-vt";
const CSS = `
html[data-board-vt]::view-transition-old(root),
html[data-board-vt]::view-transition-new(root) { animation: none; }
::view-transition-old(${BOARD_VT}) { animation: none; mix-blend-mode: normal; }
::view-transition-new(${BOARD_VT}) { mix-blend-mode: normal; animation: milo-board-reveal 400ms ease-out; }
@keyframes milo-board-reveal {
  from { clip-path: inset(100% 0 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}`;

// run update under the sweep; straight away where the browser can't, or the person asked for less motion
export function sweep(update) {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still || !("startViewTransition" in document)) return update();

  if (!document.getElementById(STYLE_ID)) {
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }
  const root = document.documentElement;
  root.dataset.boardVt = "";
  document.startViewTransition(() => flushSync(update)).finished.finally(() => delete root.dataset.boardVt);
}
