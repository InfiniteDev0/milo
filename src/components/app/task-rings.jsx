/* Three nested rounded squares — To Do, In Progress, Done.
 *
 * TWO THINGS THIS DOES DELIBERATELY:
 *
 * 1. Each arc is that status's SHARE OF THE TOTAL, not its progress toward a
 *    target. Six tasks with three done traces half the outline, because half
 *    the tasks are done — not "50% of the way there". The three always add up
 *    to one complete outline, so it describes a split, never a shortfall.
 *
 * 2. Colour comes from `currentColor`, so the rings take the card's text
 *    colour and every block's background just works. The three statuses are
 *    told apart by weight rather than hue — three saturated colours would
 *    fight whatever colour the block is, and would go illegible on a light
 *    one. Done is the loudest, which is the right emphasis for this product.
 *
 * So: set text-black on a light block, text-white on a dark one, and the rings
 * follow. `tint` overrides for the rare case that isn't enough.
 */

const RINGS = [
  { key: "done", size: 30, radius: 9, opacity: 1 },
  { key: "doing", size: 20, radius: 6, opacity: 0.55 },
  { key: "todo", size: 10, radius: 3, opacity: 0.28 },
];

const TRACK_OPACITY = 0.15;
const STROKE = 3;
const CENTER = 20;

export function TaskRings({
  todo = 0,
  doing = 0,
  done = 0,
  tint,
  className = "size-9",
}) {
  const total = todo + doing + done;
  const counts = { todo, doing, done };
  const color = tint ?? "currentColor";

  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label={
        total === 0
          ? "No tasks"
          : `${done} done, ${doing} in progress, ${todo} to do`
      }
    >
      {RINGS.map(({ key, size, radius, opacity }) => {
        // an empty day draws tracks only, rather than three closed squares
        const fraction = total === 0 ? 0 : counts[key] / total;
        // pathLength normalises each outline to 100 units, so the dash maths is
        // a plain percentage and the real perimeter never has to be measured.
        const arc = fraction * 100;

        const shared = {
          x: CENTER - size / 2,
          y: CENTER - size / 2,
          width: size,
          height: size,
          rx: radius,
          pathLength: 100,
          fill: "none",
          stroke: color,
          strokeWidth: STROKE,
        };

        return (
          <g key={key}>
            <rect {...shared} strokeOpacity={TRACK_OPACITY} />
            {arc > 0 && (
              <rect
                {...shared}
                strokeOpacity={opacity}
                strokeLinecap="round"
                strokeDasharray={`${arc} ${100 - arc}`}
                className="transition-[stroke-dasharray] duration-500 ease-out motion-reduce:transition-none"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
