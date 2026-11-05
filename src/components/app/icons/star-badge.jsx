"use client";

// Streamline's Star Badge (Sharp Gradient), green to blue: the Leaderboard's icon.
// The gradient ids are made per use, so two badges on one page can't borrow each other's.

import { useId } from "react";

export function StarBadge({ className }) {
  const id = useId().replace(/:/g, "");
  const fill = `url(#${id})`;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden className={className}>
      <path fill={fill} d="m7.11615 23.8335 3.34735-5.9508c-2.6469-.4082-4.95127-1.8543-6.48431-3.9095L.285156 20.4999H4.64091l2.47524 3.3336Z" />
      <path fill={fill} d="M20.0204 13.9737c-1.5331 2.0551-3.8376 3.5011-6.4845 3.9091l3.3473 5.9507 2.4752-3.3336h4.3558l-3.6938-6.5262Z" />
      <path
        fill={fill}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 16c-4.41828 0-8-3.5817-8-8 0-4.41828 3.58172-8 8-8 4.4183 0 8 3.58172 8 8 0 4.4183-3.5817 8-8 8Zm.0004-11.98096 1.3589 2.32955 2.493.76708-1.67 1.67001.5707 2.85362-2.7526-1.2418-2.75267 1.2418.57071-2.85362-1.67-1.67001 2.49306-.76708 1.3589-2.32955Z"
      />
      <defs>
        <linearGradient id={id} x1="1.185" x2="28.107" y1="1.926" y2="16.842" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d078" />
          <stop offset="1" stopColor="#007df0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
