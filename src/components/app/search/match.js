// How the search finds things (ported from Manasik's): every word typed has to be somewhere in
// the result — whole, the start of a word, inside one, or a slip away ("meetig" still finds
// Meeting) — and the closer the match, and the more of it in the title, the higher it comes.

// lower case, accents off: "café" and "cafe" are the same to the search
export const normalize = (text) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const tokensOf = (text) => {
  const words = normalize(text).split(/[\s,·/()|–—]+/).filter(Boolean);
  // "x-ray" as itself, and as "xray" and "x", "ray"
  const parts = words.flatMap((w) => (/[-_.:+]/.test(w) ? [w.replace(/[-_.:+]/g, ""), ...w.split(/[-_.:+]+/)] : []));
  return [...new Set([...words, ...parts].filter(Boolean))];
};

// how many single-letter changes turn one word into the other; a swap of two counts as one
function editDistance(a, b, limit) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  const rows = [];
  for (let i = 0; i <= a.length; i++) rows.push([i]);
  for (let j = 1; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let best = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, rows[i - 2][j - 2] + 1);
      rows[i][j] = v;
      best = Math.min(best, v);
    }
    if (best > limit) return limit + 1;
  }
  return rows[a.length][b.length];
}

// slips allowed: none while short, one from four letters, two from eight
const slipsAllowed = (w) => (/^\d+$/.test(w) ? 0 : w.length >= 8 ? 2 : w.length >= 4 ? 1 : 0);

// one typed word against one word of the result, 0 for not at all
function wordScore(typed, token) {
  if (token === typed) return 100;
  if (token.startsWith(typed)) return 80 - Math.min(10, token.length - typed.length);
  if (typed.length >= 2 && token.includes(typed)) return 55;
  const slips = slipsAllowed(typed);
  if (slips === 0 || token.length < 3) return 0;
  let closest = slips + 1;
  for (let len = typed.length - (typed.length >= 5 ? 1 : 0); len <= typed.length + 1; len++) {
    if (len < 3 || len > token.length) continue;
    closest = Math.min(closest, editDistance(typed, token.slice(0, len), slips));
  }
  return closest <= slips ? 40 - closest * 10 : 0;
}

// below this, a result was only found with a slip in the spelling
export const SLIP_SCORE = 45;

// a result made ready to search once, not on every key
export function searchable(title, rest) {
  return {
    title: tokensOf(title),
    rest: [...new Set(rest.filter((v) => v != null && v !== "").flatMap((v) => tokensOf(String(v))))],
  };
}

export const queryWords = (query) => [...new Set(normalize(query).split(/[\s,]+/).filter(Boolean))];

// 0 when any word is nowhere in it; a word found in the title counts in full, elsewhere a little less
export function matchScore(record, words) {
  if (words.length === 0) return 0;
  let total = 0;
  for (const word of words) {
    let best = 0;
    for (const t of record.title) best = Math.max(best, wordScore(word, t));
    for (const t of record.rest) {
      if (best >= 100) break;
      best = Math.max(best, wordScore(word, t) * 0.7);
    }
    if (best === 0) return 0;
    total += best;
  }
  return total / words.length;
}

// where the typed words are in a title, [start, end), to underline them
export function matchRanges(title, words) {
  if (words.length === 0) return [];
  const plain = normalize(title);
  const ranges = [];
  const parts = [...plain.matchAll(/[^\s,·/()|–—]+/g)].map((m) => ({ text: m[0], start: m.index ?? 0 }));
  for (const word of words) {
    const at = plain.indexOf(word);
    if (at >= 0) {
      ranges.push([at, at + word.length]);
      continue;
    }
    const slipped = parts.find((p) => wordScore(word, p.text) > 0);
    if (slipped) ranges.push([slipped.start, slipped.start + Math.min(slipped.text.length, word.length + 1)]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const joined = [];
  for (const r of ranges) {
    const last = joined.at(-1);
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else joined.push([...r]);
  }
  return joined;
}
