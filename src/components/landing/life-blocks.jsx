import { Flame } from "lucide-react";

const CATEGORIES = [
  "Morning",
  "Deep Work",
  "Learning",
  "Create",
  "Reading",
  "Wind Down",
];

const BLOCKS = [
  {
    name: "Morning",
    category: "Routine",
    status: "Done",
    statusBg: "bg-emerald-100 text-emerald-700",
    streak: 8,
    tasks: "5 tasks",
  },
  {
    name: "Deep Work",
    category: "Focus",
    status: "Ongoing",
    statusBg: "bg-[#5e17eb]/10 text-[#5e17eb]",
    streak: 12,
    tasks: "3 tasks",
  },
  {
    name: "Wind Down",
    category: "Recovery",
    status: "To do",
    statusBg: "bg-black/5 text-black/50",
    streak: 3,
    tasks: "2 tasks",
  },
];

export default function LifeBlocksSection() {
  return (
    <section className="w-full bg-white py-16 rounded-2xl sm:py-20 lg:py-24">
      <div className="mx-auto grid w-full max-w-300 grid-cols-1 items-center gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-20">
        {/* Left: copy */}
        <div className="flex flex-col gap-6">
          <h2 className="m-0 text-4xl font-extralight sm:text-5xl">
            Your day, built from Life Blocks
          </h2>
          <p className="m-0 text-lg text-zinc-600">
            Life Blocks are the pieces your day is made of. Redefine them
            every month — keep what worked, swap out what didn&apos;t.
          </p>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <span
                key={c}
                className="rounded-full bg-[#f4f2ee] px-4 py-2 text-sm font-medium text-black"
              >
                {c}
              </span>
            ))}
          </div>

          <ul className="m-0 flex list-none flex-col gap-3 p-0 text-black/70">
            <li className="flex items-start gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#5e17eb]" />
              Only one block runs at a time — switch away and it pauses,
              nothing&apos;s lost.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#5e17eb]" />
              Skip a block for the day, or repeat one that&apos;s working.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#5e17eb]" />
              A rest timer between tasks nudges you back when it&apos;s time.
            </li>
          </ul>
        </div>

        {/* Right: visual */}
        <div className="flex flex-col gap-3 rounded-[32px] bg-[#f4f2ee] p-6 sm:p-8">
          {BLOCKS.map(({ name, category, status, statusBg, streak, tasks }) => (
            <div
              key={name}
              className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-black">{name}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusBg}`}
                >
                  {status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-black/50">
                <span className="rounded-full bg-black/5 px-2.5 py-1">
                  {category}
                </span>
                <div className="flex items-center gap-3">
                  <span>{tasks}</span>
                  <span className="flex items-center gap-1 text-orange-500">
                    <Flame className="size-3.5 fill-orange-500" />
                    {streak}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
