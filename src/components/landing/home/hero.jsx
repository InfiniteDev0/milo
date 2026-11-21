// The top of the landing page: stars behind it, a small line and the headline in the navbar's 1200 box, then the view
// tabs and the app under them.

import { HeroSky } from "./hero-sky";
import { HeroStage } from "./hero-stage";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24">
      {/* the sky: dark stars on light, white on dark */}
      <HeroSky />
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center gap-2 px-4 pt-20 text-center lg:px-11 lg:pt-24">
        <span className="text-[12px] font-semibold! text-[#5e17eb] uppercase">
          Curated for you to stay productive
        </span>
        <h1 className="text-[32px] leading-[1.05] font-normal tracking-[-0.03em] text-balance sm:text-[40px] lg:text-[40px]">Manage your life in Blocks</h1>
        {/* Be a part of our productive community */}
      </div>
      {/* Block view or Task view, and the app under them */}
      <HeroStage />
    </section>
  );
}
