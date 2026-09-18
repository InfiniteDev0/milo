// How a journal page is drawn. Sizes are shares of the page (cqw across, cqh down), so a page looks the same at any size.

// pen ink; the photo's paper, for the pages glimpsed as the shelf book opens; the shelf cover's charcoal
export const INK = "#27324d";
export const PAPER = "#f8f5f2";
export const COVER = "#2b2b2b";

// how long a page takes to turn, in seconds
export const TURN = 0.7;

// the open book is public/bookui.png cut out and split at the spine: two pages of 678×912
export const PAGE_IMAGE = ["/journal-page-left.webp", "/journal-page-right.webp"];
export const BOOK_RATIO = 1356 / 912;

// the stacked page edges down each outer side, which stay put when a single leaf turns
export const LEAF_CLIP = ["inset(0 0 0 6%)", "inset(0 5% 0 0)"];

// lines of writing on a page, each 3.8% of the page tall, starting 9% down
export const LINES = 21;
const LINE = 3.8;
const TOP = 9;
const SIZE = 0.85;

// where the writing goes on the left (0) or right (1) page; the wider margin is on the outside, clear of the page edges
export const textBox = (side) => ({
  top: `${TOP}cqh`,
  height: `${LINES * LINE}cqh`,
  left: side === 0 ? "14cqw" : "9cqw",
  right: side === 0 ? "9cqw" : "14cqw",
  lineHeight: `${LINE}cqh`,
  fontSize: `${LINE * SIZE}cqh`,
  color: INK,
});
