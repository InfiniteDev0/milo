// The vision board as wishes: each can be tied to the blocks that serve it, achieved, or set down.
// Boards from setup are plain text and read the same way; they become full wishes the first time one changes.

const BLANK = { blocks: [], ifThen: "", status: "open", achievedAt: null, note: "" };

export const newWish = (text) => ({ id: crypto.randomUUID(), text, ...BLANK });

export function readVision(list) {
  return (list ?? []).map((v, i) =>
    typeof v === "string" ? { id: `wish-${i}`, text: v, ...BLANK } : { ...BLANK, ...v },
  );
}

// the month you're leaving, kept on the year under its stamp, so the year page can still say what you called it
export function rememberMonth(year, month) {
  if (!month?.stamp) return year;
  return {
    ...(year ?? {}),
    months: { ...(year?.months ?? {}), [month.stamp]: { name: month.name ?? "", icon: month.icon ?? "" } },
  };
}
