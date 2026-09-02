import MiloReaction from "../milo-reaction";

export default function Philosophy() {
  return (
    <section className="w-full bg-[#f4f2ee] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto flex w-full max-w-300 flex-col items-center gap-14 px-6 sm:px-10 lg:px-20">
        {/* Heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="m-0 text-4xl font-extralight sm:text-5xl">
            No guilt. No shame. No punishment.
          </h2>
          <p className="m-0 max-w-2xl text-lg text-zinc-600">
            Milo isn&apos;t here to optimize every second of your life.
            It&apos;s here to help you organize it — calmly.
          </p>
        </div>

        {/* Contrast cards */}
        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-[28px] border-black/[0.06] bg-red-100 p-8">
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-medium text-black">Other apps</h1>
              <p className="m-0 text-xl font-medium text-black/40 line-through decoration-red-500 decoration-2">
                You failed your productivity goal.
              </p>
            </div>
            {/* sighs on its own; sinks further when you hover it */}
            <MiloReaction
              mood="angry"
              hoverMood="angrier"
              blinkRate={0.55}
              className="size-15 shrink-0 cursor-pointer touch-none select-none"
            />
          </div>

          <div className="flex items-center gap-4 rounded-[28px] bg-emerald-100 p-8 text-black">
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-medium text-[#761bff]">Milo</h1>
              <p className="m-0 text-xl font-medium">
                You showed up for 6 things today. Nice work.
              </p>
            </div>
            {/* size-20, not size-15: cheer needs a wider crop, so the larger box
                keeps this face optically the same size as the one on the left */}
            <MiloReaction
              mood="happy"
              hoverMood="cheer"
              className="size-20 shrink-0 cursor-pointer touch-none select-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
