// The top of the landing page: a small line and the headline, centred in the navbar's 1200 box.

import { MiloFloat } from "./milo-float";
import { ViewSwitch } from "./view-switch";

export function Hero() {
  return (
    <section>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-2 px-4 pt-20 pb-24 text-center lg:px-11 lg:pt-24">
        <span className="text-[12px] font-semibold! text-[#5e17eb] uppercase">
          Curated for you to stay productive
        </span>
        <h1 className="text-[32px] leading-[1.05] font-normal tracking-[-0.03em] text-balance sm:text-[40px] lg:text-[40px]">Manage your life in Blocks</h1>
        {/* Be a part of our productive community */}
        {/* Block view or Task view, as the app switches them */}
        <div className="mt-6">
          <ViewSwitch />
        </div>
      </div>
      <MiloFloat />
    </section>
  );
}
