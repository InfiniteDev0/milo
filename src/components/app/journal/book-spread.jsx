"use client";

// The open journal: the book photo's two facing pages, which you write straight onto.
// A full page passes the rest of your writing — and your cursor — on to the next page, turning the leaf when it must.

import { useEffect, useLayoutEffect, useRef } from "react";
import { splitToFit } from "./fit-text";
import { bookHand } from "./font";
import { Page, PageWords } from "./page";
import { PageFlip } from "./page-flip";
import { BOOK_RATIO, INK, textBox } from "./paper";

// children sit on top of the book, like the page-turn buttons
export function BookSpread({ book, children }) {
  const { pages, spread, flip, turn, endTurn, writePage, flowOn } = book;
  const live = [useRef(null), useRef(null)];
  // hidden copies of each page, to measure what fits without touching the page you're typing on
  const mirror = [useRef(null), useRef(null)];
  // where you're typing, and where the cursor lands once writing has moved
  const caret = useRef(null);
  const landing = useRef(null);
  const first = spread * 2;
  const text = (n) => pages[n] ?? "";

  // open with the pen on the first page
  useEffect(() => {
    const el = live[0].current;
    el?.focus();
    el?.setSelectionRange(el.value.length, el.value.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    // a page holding more than its lines keeps what fits and hands the rest on
    for (const side of [0, 1]) {
      const el = live[side].current;
      if (!el || el.scrollHeight <= el.clientHeight + 1) continue;

      const page = first + side;
      const [fit, rest] = splitToFit(mirror[side].current, text(page));
      if (!rest) continue;

      const at = caret.current;
      if (at?.page === page) {
        const past = at.pos > fit.length;
        // writing past the last line carries on at the top of the next page; editing higher up stays put
        landing.current = past ? { page: page + 1, pos: at.pos - fit.length } : at;
        caret.current = landing.current;
        if (past && side === 1) turn(1);
      }
      flowOn(page, fit, rest);
      return;
    }

    // everything fits: put the cursor where the writing went
    const want = landing.current;
    if (want && want.page >= first && want.page <= first + 1 && live[want.page - first].current) {
      const el = live[want.page - first].current;
      el.focus();
      el.setSelectionRange(want.pos, want.pos);
      landing.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, spread, flip]);

  const onKeyDown = (e, page) => {
    // Backspace at the very start of a page steps back to the end of the one before
    const el = e.currentTarget;
    if (e.key !== "Backspace" || page === 0 || el.selectionStart !== 0 || el.selectionEnd !== 0) return;
    e.preventDefault();
    const pos = text(page - 1).length;
    caret.current = { page: page - 1, pos };
    if (page % 2 === 0) {
      landing.current = caret.current;
      turn(-1);
    } else {
      live[0].current?.focus();
      live[0].current?.setSelectionRange(pos, pos);
    }
  };

  // while a leaf turns: the pages it uncovers lie underneath, and the leaf carries the two it joins
  const turning = flip === 1 ? [first, first + 3] : [first - 2, first + 1];
  const leaf = flip === 1 ? [first + 1, first + 2] : [first, first - 1];

  const livePage = (side) => {
    const page = first + side;
    const style = textBox(side);
    return (
      <Page side={side} number={page + 1}>
        <textarea
          ref={live[side]}
          value={text(page)}
          onChange={(e) => {
            caret.current = { page, pos: e.target.selectionStart };
            writePage(page, e.target.value);
          }}
          onSelect={(e) => {
            caret.current = { page, pos: e.currentTarget.selectionStart };
          }}
          onKeyDown={(e) => onKeyDown(e, page)}
          aria-label={`Page ${page + 1}`}
          placeholder={page === 0 ? "Start anywhere…" : ""}
          spellCheck={false}
          style={{ ...style, caretColor: INK }}
          className={`${bookHand.className} absolute resize-none overflow-hidden border-0 bg-transparent p-0 outline-none placeholder:text-[#27324d]/35`}
        />
        <textarea
          ref={mirror[side]}
          aria-hidden
          tabIndex={-1}
          readOnly
          style={style}
          className={`${bookHand.className} pointer-events-none invisible absolute resize-none overflow-hidden border-0 p-0`}
        />
      </Page>
    );
  };

  return (
    // the book keeps the photo's shape, as big as the space allows
    <div className="absolute inset-0 flex items-center justify-center" style={{ containerType: "size" }}>
      <div
        className="relative"
        style={{
          width: `min(100cqw, ${(BOOK_RATIO * 100).toFixed(2)}cqh)`,
          aspectRatio: `${BOOK_RATIO}`,
          perspective: "2000px",
        }}
      >
        {/* resting on the desk */}
        <span aria-hidden className="absolute inset-x-[1.5%] inset-y-[1%] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.55)]" />

        {[0, 1].map((side) => (
          <div key={flip ? `under-${turning[side]}` : first + side} className={`absolute inset-y-0 w-1/2 ${side ? "right-0" : "left-0"}`}>
            {flip ? (
              <Page side={side} number={turning[side] + 1}>
                <PageWords side={side} text={text(turning[side])} />
              </Page>
            ) : (
              livePage(side)
            )}
          </div>
        ))}

        {flip !== 0 && (
          <PageFlip
            key={`${first}:${flip}`}
            dir={flip}
            front={{ number: leaf[0] + 1, text: text(leaf[0]) }}
            back={{ number: leaf[1] + 1, text: text(leaf[1]) }}
            onDone={endTurn}
          />
        )}

        {children}
      </div>
    </div>
  );
}
