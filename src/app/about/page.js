import Link from "next/link";
import { Button } from "@/components/ui/button";
import MiloFace from "@/components/MiloFace";
import MiloReaction from "@/components/milo-reaction";
import DayDemo from "@/components/about/day-demo";

/* Copy lives at the top so it can be edited without touching layout.
   Everything traces back to POSITIONING.md and PRODUCT.md — change one, change
   the other. No competitor is named anywhere on this page, by policy. */

// The shapes the moment takes, as chips instead of a paragraph.
const SHAPES = [
  "a broken chain",
  "a red zero",
  "3 overdue · 12 overdue · 47 overdue",
  "a grid of grey squares, four missing",
  "“you haven’t opened the app in 3 days”",
  "62% complete",
];

// Titan does numbered aphorisms. These are ours — and every one is a refusal.
const PROMISES = [
  ["01", "Nothing here can be late", "No red, no “3 days late”, no count of what didn’t happen. A task that didn’t happen is a task that hasn’t happened."],
  ["02", "A skipped day leaves no scar", "Skip a block, a task, a habit — no mark, no gap in a grid, no notification. It simply didn’t occur, and Milo has no opinion about it."],
  ["03", "You wrote the plan. Milo just runs it", "Milo never writes your day for you, never reorders it, never decides what matters."],
  ["04", "“Morning” is a complete answer", "A block can carry a start time. It never needs one. A block that starts late is not late."],
  ["05", "One thing, never the whole day", "One block runs at a time, by design. Milo never puts your entire day in front of you as a demand."],
  ["06", "We count what you did", "“You showed up for 6 things today.” Never 6 of 8. Never a percentage. Never a gap."],
];

// True things about the product. Not user counts — we don't have users yet.
const FACTS = [
  ["0", "ways to be overdue", "There is no late state anywhere in Milo. It isn’t hidden or softened. It doesn’t exist."],
  ["1", "block at a time", "The most decisions Milo will ask you for at once."],
  ["4–6", "shapes in a day", "Not forty timestamps. You name them, and you redraw them every month."],
];

const DOORS = [
  ["People who work for themselves", "Freelancers, creators, anyone working from home. No boss shaping the day, and a schedule one client call can rearrange."],
  ["People whose plans never survive a clock", "Plenty of them have ADHD. Plenty are burnt out. Plenty just have a life that won’t hold still. If a timed plan has never once made it past mid-morning, that isn’t a discipline problem — it’s the wrong shape of plan."],
  ["People who are simply busy", "A job, a family, a commute. You get four things done out of ten and software decides that was a failure. It wasn’t."],
];

const NEVER = [
  ["An app that plans your day", "You chose your blocks this month. There’s nothing left for a machine to decide."],
  ["A coach", "Milo will never tell you what you should have done."],
  ["A team tool", "No shared boards, no assignees, nobody watching your day but you."],
  ["A second brain", "No wikis, no databases. Milo is the day layer and nothing more."],
];

const POSES = ["content", "focused", "proud", "happy", "cheer"];

export default function About() {
  return (
    <div className="flex w-full flex-col gap-14 px-3 pb-8 sm:gap-20">
      {/* ── Thesis ─────────────────────────────────────────────── */}
      <section className="mx-auto flex w-full max-w-300 flex-col items-center gap-8 px-6 pt-6 text-center sm:px-10 lg:px-20">
        <div className="flex items-end gap-5">
          {POSES.map((m, i) => (
            <MiloFace
              key={m}
              mood={m}
              gaze={false}
              reactToScroll={false}
              className={`touch-none bg-white rounded-2xl select-none ${
                i === 2 ? "size-24 sm:size-28" : "size-12 opacity-45 sm:size-16"
              }`}
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-5">
          <span className="text-sm tracking-wide text-zinc-500">About Milo</span>
          <h1 className="m-0 max-w-4xl text-4xl font-extralight sm:text-5xl lg:text-6xl">
            Milo notices what you did,
            <br className="hidden sm:block" /> not what you didn&apos;t.
          </h1>
          <p className="m-0 max-w-2xl text-lg text-zinc-600">
            A day planner for days that don&apos;t go to plan.
          </p>
        </div>
      </section>

      {/* ── The moment — a big typographic slab ────────────────── */}
      <section className="w-full overflow-hidden rounded-[32px] bg-red-800">
        <div className="mx-auto flex w-full max-w-300 flex-col gap-10 px-6 py-16 sm:px-10 sm:py-20 lg:px-20">
          <span className="text-sm tracking-wide">
            Why Milo exists
          </span>

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
            <h2 className="m-0 max-w-3xl text-4xl font-extralight leading-[1.1] text-white sm:text-6xl">
              “You skipped the habit today.
              <span className="text-black"> You failed.”</span>
            </h2>
            <MiloReaction
              mood="angry"
              hoverMood="angrier"
              blinkRate={0.55}
              className="size-20 shrink-0 cursor-pointer touch-none select-none sm:size-28"
            />
          </div>

          <p className="m-0 max-w-2xl text-lg">
            No app writes it that plainly. It arrives in other shapes:
          </p>

          <div className="flex flex-wrap gap-2.5">
            {SHAPES.map((s) => (
              <span
                key={s}
                className="rounded-full  px-4 py-2 text-sm text-white/70 bg-black"
              >
                {s}
              </span>
            ))}
          </div>

          <p className="m-0 max-w-3xl text-xl text-white/80 sm:text-2xl">
            The message underneath is always the same — your life was
            inconsistent, and the software noticed.
          </p>
          <p className="m-0 max-w-3xl text-lg">
            A day that goes sideways isn&apos;t an unusual day. It&apos;s most
            days. But these tools reward the straight line, and draw everything
            else as damage — so the person who had a real week opens their
            planner, sees a monument to what they didn&apos;t do, and closes it.
            Then blames themselves.
          </p>
        </div>
      </section>

      {/* ── The research ───────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-300 px-6 sm:px-10 lg:px-20">
        <div className="grid grid-cols-1 items-center gap-8 rounded-[32px] bg-[#f4f2ee] p-8 sm:p-12 lg:grid-cols-[auto_1fr] lg:gap-14">
          <div className="flex flex-col">
            <span className="text-6xl font-extralight leading-none sm:text-7xl">
              119
            </span>
            <span className="mt-2 text-sm text-black/50">
              first-year students,
              <br />
              followed across two midterms
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="m-0 max-w-2xl text-2xl font-extralight sm:text-3xl">
              Students who forgave themselves for putting off the first exam put
              it off less before the second one.
            </h2>
            <p className="m-0 max-w-2xl text-zinc-600">
              The ones who stayed self-critical repeated the delay. The
              researchers put it down to reduced negative feeling: once the
              guilt was gone, there was nothing left to avoid. Being hard on
              yourself didn&apos;t produce the next good day — letting it go did.
            </p>
            <p className="m-0 text-sm text-black/40">
              Wohl, Pychyl &amp; Bennett (2010),{" "}
              <a
                href="https://www.sciencedirect.com/science/article/abs/pii/S0191886910000474"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-black/20 underline-offset-2 transition-colors hover:text-black"
              >
                “I forgive myself, now I can study”
              </a>
              , Personality and Individual Differences 48(7), 803–808. Milo
              isn&apos;t a therapy, and it doesn&apos;t claim to be — this is
              simply the shape of the evidence we designed toward.
            </p>
          </div>
        </div>
      </section>

      {/* ── Live: the only number Milo shows you ───────────────── */}
      <section className="mx-auto grid w-full max-w-300 grid-cols-1 items-center gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-20">
        <div className="flex flex-col gap-5">
          <span className="text-sm tracking-wide text-zinc-500">
            What that looks like
          </span>
          <h2 className="m-0 text-3xl font-extralight sm:text-4xl">
            Start a block. Skip one. Watch nothing bad happen.
          </h2>
          <p className="m-0 text-lg text-zinc-600">
            This is real, not a screenshot. Run a block and the tasks tick off.
            Switch away and it pauses exactly where it was. Hit{" "}
            <span className="text-black">Skip</span> on any of them — then look
            at the bottom of the card. The number only ever counts up.
          </p>
        </div>
        <DayDemo />
      </section>

      {/* ── Facts ──────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-300 px-6 sm:px-10 lg:px-20">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[32px] bg-black/8 sm:grid-cols-3">
          {FACTS.map(([n, label, body]) => (
            <div key={label} className="flex flex-col gap-2 bg-white p-8">
              <span className="text-5xl font-extralight leading-none text-[#5e17eb]">
                {n}
              </span>
              <span className="text-lg font-medium">{label}</span>
              <p className="m-0 text-sm text-zinc-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Promises ───────────────────────────────────────────── */}
      <section className="mx-auto flex w-full max-w-300 flex-col gap-10 px-6 sm:px-10 lg:px-20">
        <div className="flex flex-col gap-4">
          <span className="text-sm tracking-wide text-zinc-500">
            What Milo promises
          </span>
          <h2 className="m-0 max-w-3xl text-3xl font-extralight sm:text-4xl">
            Six things Milo will never do to you.
          </h2>
        </div>

        <ol className="m-0 grid list-none grid-cols-1 gap-px overflow-hidden rounded-[28px] bg-black/8 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {PROMISES.map(([n, title, body]) => (
            <li key={n} className="flex flex-col gap-3 bg-white p-8">
              <span className="text-sm text-[#5e17eb]">/{n}</span>
              <h3 className="m-0 text-xl font-medium">{title}</h3>
              <p className="m-0 text-zinc-600">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Who it's for ───────────────────────────────────────── */}
      <section className="w-full rounded-[32px] bg-[#f4f2ee] py-16 sm:py-20">
        <div className="mx-auto flex w-full max-w-300 flex-col gap-10 px-6 sm:px-10 lg:px-20">
          <div className="flex flex-col gap-4">
            <span className="text-sm tracking-wide text-zinc-500">
              Who it&apos;s for
            </span>
            <h2 className="m-0 max-w-3xl text-3xl font-extralight sm:text-4xl">
              Not a job title. Not a diagnosis.
            </h2>
            <p className="m-0 max-w-2xl text-lg text-zinc-600">
              What they share is having closed an app because it made them feel
              worse — and half-suspecting that was their fault rather than the
              software&apos;s. It wasn&apos;t.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {DOORS.map(([title, body]) => (
              <div key={title} className="flex flex-col gap-3 rounded-[28px] bg-white p-8">
                <h3 className="m-0 text-lg font-medium">{title}</h3>
                <p className="m-0 text-zinc-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The person ─────────────────────────────────────────── */}
      <section className="mx-auto flex w-full max-w-300 flex-col gap-10 px-6 sm:px-10 lg:px-20">
        <div className="flex flex-col gap-4">
          <span className="text-sm tracking-wide text-zinc-500">
            Who&apos;s building it
          </span>
          <h2 className="m-0 max-w-3xl text-3xl font-extralight sm:text-4xl">
            One person, in public.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-16">
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-[28px] bg-[#f4f2ee]">
              <img
                src="/abdiaziz.jpeg"
                alt="Abdiaziz, who builds Milo"
                className="aspect-4/5 w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-medium">Abdiaziz</span>
              <span className="text-sm text-zinc-500">Designs and builds Milo</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-lg text-zinc-600">
            {/* ────────────────────────────────────────────────────────────
                ABDIAZIZ — WRITE THIS PART YOURSELF.

                It's the one section nobody can write for you, and it's what
                makes the rest of the page believable. Two or three short
                paragraphs, plainly:

                  · the day you noticed it — an actual day, an actual app
                  · what you were trying to do, and what it told you instead
                  · why you built rather than switching apps again
                  · what you want Milo to be for someone else

                Don't sell. One specific true sentence about your own week will
                outperform everything else on this page.
               ──────────────────────────────────────────────────────────── */}
            <p className="m-0">
              I kept meeting the same moment in every app I tried, and I got
              tired of being told that an ordinary week was a failure.
            </p>
            <p className="m-0">
              <span className="text-black">[Your story goes here.]</span> The
              specific day, the specific app, what it said to you, and what you
              decided to do about it.
            </p>
            {/* ──────────────── end of the part to replace ──────────────── */}

            <p className="m-0">
              Milo is being built in the open — the decisions, the things that
              get cut, the parts that don&apos;t work yet.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-black px-5 py-2.5 text-sm text-white transition-opacity duration-200 hover:opacity-85"
              >
                Watch it get built
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white px-5 py-2.5 text-sm text-black transition-colors duration-200 hover:bg-black/5"
              >
                Follow along
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────
          FIRST REAL REVIEW GOES HERE.

          Deliberately left out rather than mocked up. A testimonial only works
          because it's true and attributable — a made-up one attached to a made-up
          name is the fastest way to lose the trust this whole page is built on.

          When someone sends you a genuine message about Milo: ask if you can
          quote them, use their real name, and drop it in right here. One real
          line beats six invented ones.
         ──────────────────────────────────────────────────────────────── */}

      {/* ── What it will never be ──────────────────────────────── */}
      <section className="mx-auto flex w-full max-w-300 flex-col gap-10 px-6 sm:px-10 lg:px-20">
        <div className="flex flex-col gap-4">
          <span className="text-sm tracking-wide text-zinc-500">
            What Milo won&apos;t become
          </span>
          <h2 className="m-0 max-w-3xl text-3xl font-extralight sm:text-4xl">
            The things that are easier to promise than to refuse.
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-black/8 rounded-[28px] bg-white px-8">
          {NEVER.map(([title, body]) => (
            <div
              key={title}
              className="flex flex-col gap-1 py-6 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <h3 className="m-0 text-lg font-medium sm:w-64 sm:shrink-0">
                {title}
              </h3>
              <p className="m-0 text-zinc-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="w-full">
        <div className="flex w-full flex-col items-center gap-6 rounded-[32px] bg-green-400 text-black px-6 py-16 text-center sm:px-10 sm:py-20">
          <MiloReaction
            mood="happy"
            hoverMood="cheer"
            className="size-20 cursor-pointer touch-none select-none"
          />
          <h2 className="m-0 max-w-2xl text-4xl font-extralight  sm:text-5xl">
            Have the week you actually had.
          </h2>
          <p className="m-0 max-w-xl text-lg text-black/60">
            Plan calmly, live your day, pause when you need to, and look back
            without being told off.
          </p>
          <Link href="/login">
            <Button className="flex h-12 w-fit items-center gap-2 rounded-full bg-[#5e17eb] px-5 py-2 text-md font-normal  transition-opacity duration-300 hover:bg-[#5e17eb] hover:opacity-85">
              Try Milo, it&apos;s Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
