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
            Milo isn&apos;t here to optimize every second of your life. It&apos;s
            here to help you organize it — calmly.
          </p>
        </div>

        {/* Contrast cards */}
        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-[28px] border-2 border-black/[0.06] bg-white p-8">
            <span className="text-sm font-medium text-black/40">
              Other apps
            </span>
            <p className="m-0 text-xl font-medium text-black/40 line-through decoration-red-300 decoration-2">
              You failed your productivity goal.
            </p>
          </div>
          <div className="flex flex-col gap-4 rounded-[28px] bg-black p-8 text-white">
            <span className="text-sm font-medium text-[#b98bff]">Milo</span>
            <p className="m-0 text-xl font-medium">
              You showed up for 6 things today. Nice work.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
