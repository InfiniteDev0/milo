// The Featured column's two app-style icons, drawn here: a glossy gradient tile with a smiling phone, and a pale
// tile holding the theme colours as a flower.

// a phone with Milo's smile on it
export function PhoneIcon() {
  return (
    <svg viewBox="0 0 40 40" className="size-10 shrink-0" aria-hidden>
      <defs>
        <linearGradient id="fi-phone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7eb3" />
          <stop offset="0.5" stopColor="#a46bff" />
          <stop offset="1" stopColor="#4f8bff" />
        </linearGradient>
        <linearGradient id="fi-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#fi-phone)" />
      <rect width="40" height="40" rx="10" fill="url(#fi-gloss)" />
      <rect x="12.5" y="8" width="15" height="24" rx="4" fill="#fff" />
      <path d="M16.5 20.5q3.5 3.5 7 0" fill="none" stroke="#8b6cff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="11" r="0.9" fill="#c9bbff" />
    </svg>
  );
}

// the theme colours, overlapping like petals
export function ThemesIcon() {
  return (
    <svg viewBox="0 0 40 40" className="size-10 shrink-0" aria-hidden>
      <rect width="40" height="40" rx="10" fill="#f1ecff" />
      <g style={{ mixBlendMode: "multiply" }}>
        <circle cx="20" cy="14.5" r="6" fill="#b660e0" opacity="0.85" />
        <circle cx="25.5" cy="20" r="6" fill="#ee5e99" opacity="0.85" />
        <circle cx="20" cy="25.5" r="6" fill="#0f9d9f" opacity="0.85" />
        <circle cx="14.5" cy="20" r="6" fill="#6985ff" opacity="0.85" />
      </g>
      <circle cx="20" cy="20" r="2.6" fill="#fff" />
    </svg>
  );
}
