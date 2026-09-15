// A day as a local date string: the key days, plans and waiting notes share. It turns at your midnight, not UTC's.

export const stampOf = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

export const stampToday = () => stampOf(new Date());

// the Date at local midnight for a stamp
export function dateOf(stamp) {
  const [y, m, d] = stamp.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// the day after; Date rolls months and years over on its own
export function nextStamp(stamp) {
  const [y, m, d] = stamp.split("-").map(Number);
  return stampOf(new Date(y, m - 1, d + 1));
}
