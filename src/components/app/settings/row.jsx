"use client";

// A setting reads left to right: what it is, then what it's set to. The old
// layout stacked them, so the page was a column of headings with no answers.

export function Row({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-3 border-t border-foreground/8 py-5 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-md">{label}</span>
        {hint && <span className="text-sm text-foreground/50">{hint}</span>}
      </div>

      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  );
}

/* "Never" is a first-class option, not the absence of one. It sits in the track
   with the others, so choosing it is a choice rather than a refusal. */
export function Segmented({ value, options, onChange, label }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap gap-0.5 rounded-xl bg-foreground/[0.05] p-1"
    >
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`cursor-pointer rounded-[10px] px-3 py-1.5 text-sm transition-colors ${
            value === o.value
              ? "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0_/_0.12)]"
              : "text-foreground/45 hover:text-foreground/80"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
