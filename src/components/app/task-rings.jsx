"use client";

/* Three nested rounded squares — To Do, In Progress, Done.
 *
 * Each arc is that status's SHARE OF THE TOTAL, not progress toward a target.
 * Six tasks with three done traces half the outline because half the tasks are
 * done, not "50% of the way there". The three always add up to one complete
 * outline, so it describes a split and never a shortfall.
 *
 * COLOUR IS THE STATUS, not a shade of the block. This used to take the card's
 * ink at three opacities — 1, 0.55, 0.28 — and tell the statuses apart by
 * weight. On a saturated block the faint two disappeared, and weight alone
 * never said WHICH status anyway. These are the same three colours the status
 * pills and the task sheet's buttons use, so the mapping is learned once.
 *
 * The plate is what makes that safe: a neutral disc behind the rings, so green
 * never has to survive being drawn on the green block.
 */

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DONE, PAUSE } from "@/lib/palette";

const TODO = "#141414";

const RINGS = [
  { key: "done", size: 30, radius: 9, colour: DONE },
  { key: "doing", size: 20, radius: 6, colour: PAUSE },
  { key: "todo", size: 10, radius: 3, colour: TODO },
];

const TRACK = "#00000014";
const STROKE = 3.5;
const CENTER = 20;

// Zeros are left out — "0 in progress" is a number about nothing.
const describe = ({ todo, doing, done }) =>
  [
    done > 0 && `${done} done`,
    doing > 0 && `${doing} in progress`,
    todo > 0 && `${todo} to do`,
  ]
    .filter(Boolean)
    .join(" · ") || "No tasks";

export function TaskRings({ todo = 0, doing = 0, done = 0, className = "size-9" }) {
  const total = todo + doing + done;
  const counts = { todo, doing, done };
  const label = describe(counts);

  return (
    <TooltipProvider>
      <Tooltip>
        {/* a span, not a button: these sit INSIDE the block card's button and a
            nested button is invalid HTML */}
        <TooltipTrigger
          render={
            <span
              className={`flex shrink-0 items-center justify-center rounded-xl bg-chip/85 ${className}`}
            />
          }
        >
          <svg viewBox="0 0 40 40" className="size-full p-0.5" role="img" aria-label={label}>
            {RINGS.map(({ key, size, radius, colour }) => {
              // an empty block draws tracks only, not three closed squares
              const fraction = total === 0 ? 0 : counts[key] / total;
              // pathLength normalises each outline to 100, so the dash is a
              // plain percentage and the perimeter never has to be measured
              const arc = fraction * 100;

              const shared = {
                x: CENTER - size / 2,
                y: CENTER - size / 2,
                width: size,
                height: size,
                rx: radius,
                pathLength: 100,
                fill: "none",
                strokeWidth: STROKE,
              };

              return (
                <g key={key}>
                  <rect {...shared} stroke={TRACK} />
                  {arc > 0 && (
                    <rect
                      {...shared}
                      stroke={colour}
                      strokeLinecap="round"
                      strokeDasharray={`${arc} ${100 - arc}`}
                      className="transition-[stroke-dasharray] duration-500 ease-out motion-reduce:transition-none"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </TooltipTrigger>

        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
