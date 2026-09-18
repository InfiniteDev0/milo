// How much of some writing fits on one page: the longest start of it that fills the page without scrolling,
// broken between words where that's close by. Measures with a hidden copy of the page, so the real font and size decide.

export function splitToFit(el, text) {
  const fits = (s) => {
    el.value = s;
    return el.scrollHeight <= el.clientHeight + 1;
  };

  if (fits(text)) return [text, ""];

  // the longest start that fits
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (fits(text.slice(0, mid))) lo = mid;
    else hi = mid - 1;
  }

  // step back to the last space or line break, unless that would leave a big gap
  const gap = Math.max(text.lastIndexOf(" ", lo - 1), text.lastIndexOf("\n", lo - 1));
  const cut = gap > 0 && lo - gap < 40 ? gap + 1 : lo;
  return [text.slice(0, cut), text.slice(cut)];
}
