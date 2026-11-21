// The top of the landing page: a small line and the headline, centred in the navbar's 1200 box.

import { MiloFloat } from "./milo-float";

export function Hero() {
  return (
    <section>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-4 px-4 pt-20 pb-24 text-center lg:px-11 lg:pt-24">
        <span className="font-mono text-[12px] tracking-[0.08em] text-[#5e17eb] uppercase">Milo tasks &amp; notes</span>
        <h1 className="text-[32px] leading-[1.05] font-normal tracking-[-0.03em] text-balance sm:text-[40px] lg:text-[48px]">Never feel behind again</h1>
      </div>
      <MiloFloat />
    </section>
  );
}
