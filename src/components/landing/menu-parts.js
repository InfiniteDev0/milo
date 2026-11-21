// What every navbar panel shares: the column title, and a link row with a soft fill under the pointer.
// Links are Albert Sans, slightly bold, marked ! since globals.css's unlayered a { 500 } beats plain utilities.

// column titles: Outfit, small and bold, in normal case (! over globals.css's span rules)
export const HEAD = "[font-family:'Outfit']! text-[12px] font-bold! text-black/45 dark:text-white/45";

export const ITEM =
  "-mx-2 flex items-center rounded-md px-2 py-1.5 [font-family:'Albert_sans']! text-[14px] font-medium! text-black/85 transition-colors hover:bg-black/[0.04] hover:text-black dark:text-white/85 dark:hover:bg-white/[0.06] dark:hover:text-white";

// Solutions' columns; on a wide screen a thin line between each and the next
export const GRID =
  "grid grid-cols-2 gap-6 lg:grid-cols-4 lg:[&>*+*]:border-l lg:[&>*+*]:border-black/[0.08] lg:[&>*+*]:pl-6 dark:lg:[&>*+*]:border-white/10";
